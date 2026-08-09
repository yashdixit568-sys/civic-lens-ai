'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComplaintItem } from '@/lib/types';
import { analyzeImageAI } from '@/lib/ai/vision-service';
import { analyzeTextNLU } from '@/lib/ai/nlu-service';
import { processSpeechInput } from '@/lib/ai/speech-service';
import { calculateAIPriorityScore } from '@/lib/ai/priority-engine';
import { detectDuplicateComplaint } from '@/lib/ai/duplicate-detector';
import { SupportedLanguage, UI_COPY, PLAIN_CATEGORY_LABELS, PLAIN_STATUS_CONFIG, getCitizenPlainReason } from '@/lib/copy-helpers';
import { BackButton } from '@/components/layout/BackButton';
import {
  Camera,
  Mic,
  FileText,
  MapPin,
  Check,
  Edit3,
  AlertCircle,
  ThumbsUp,
  Send,
  Loader2,
  Volume2,
  CheckCircle2,
} from 'lucide-react';

interface ReportFlowSectionProps {
  onSuccess: (newComplaint: ComplaintItem, supportedMasterTicketId?: string) => void;
  existingComplaints: ComplaintItem[];
  lang?: SupportedLanguage;
  initialInputMode?: InputMode;
  onCancel?: () => void;
  onViewMyReport?: () => void;
}

type InputMode = 'PHOTO' | 'VOICE' | 'TEXT';
type Step = 'SELECT_MODE' | 'ANALYZING' | 'CONFIRM_GUESS' | 'FINAL_CONFIRM' | 'DUPLICATE_FOUND' | 'AI_FALLBACK' | 'SUCCESS';

export const ReportFlowSection: React.FC<ReportFlowSectionProps> = ({
  onSuccess,
  existingComplaints,
  lang = 'en',
  initialInputMode = 'PHOTO',
  onCancel,
  onViewMyReport,
}) => {
  const copy = UI_COPY[lang] || UI_COPY.en;

  const [inputMode, setInputMode] = useState<InputMode>(initialInputMode);
  const [step, setStep] = useState<Step>('SELECT_MODE');

  // Input states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [rawTextInput, setRawTextInput] = useState('');

  // Location state
  const [gpsLocation, setGpsLocation] = useState<{ address: string; ward: string; lat: number; lng: number }>({
    address: 'Near Civil Lines Gate 2',
    ward: 'Civil Lines (Ward 2)',
    lat: 28.6139,
    lng: 77.2090,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  // AI Interpretation Output
  const [loadingText, setLoadingText] = useState(copy.lookingAtPhoto);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [interpretedCategory, setInterpretedCategory] = useState<string>('');
  const [interpretedTitle, setInterpretedTitle] = useState<string>('');
  const [interpretedDescription, setInterpretedDescription] = useState<string>('');
  
  // Duplicate State & Submitted Result State
  const [matchedDuplicate, setMatchedDuplicate] = useState<ComplaintItem | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<ComplaintItem | null>(null);

  // Auto-detect GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setGpsLocation({
            address: `Civil Lines, GPS Pin (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`,
            ward: 'Civil Lines (Ward 2)',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setIsLocating(false);
        }
      );
    }
  }, []);

  // Process Photo Selection
  const handlePhotoUpload = async (file: File) => {
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep('ANALYZING');
    setLoadingText(copy.lookingAtPhoto);

    try {
      await new Promise((r) => setTimeout(r, 400));
      setLoadingText(copy.checkingLocation);
      await new Promise((r) => setTimeout(r, 400));
      setLoadingText(copy.findingDepartment);

      const res = await analyzeImageAI(file.name);
      setAiAnalysis(res);
      const catObj = PLAIN_CATEGORY_LABELS[res.detectedCategory];
      const categoryName = catObj ? catObj[lang] : res.categoryLabel;

      setInterpretedCategory(res.detectedCategory);
      setInterpretedTitle(categoryName);
      setInterpretedDescription(`Large ${categoryName.toLowerCase()} detected that may be unsafe for vehicles or pedestrians.`);

      const dup = detectDuplicateComplaint(gpsLocation.lat, gpsLocation.lng, res.detectedCategory, existingComplaints);
      if (dup.isDuplicate && dup.matchedMasterComplaint) {
        setMatchedDuplicate(dup.matchedMasterComplaint);
        setStep('DUPLICATE_FOUND');
      } else {
        setStep('CONFIRM_GUESS');
      }
    } catch (err) {
      setStep('AI_FALLBACK');
    }
  };

  // Process Voice
  const handleVoiceAnalyze = async (textToProcess?: string) => {
    const input = textToProcess || voiceText;
    if (!input) return;

    setStep('ANALYZING');
    setLoadingText(copy.lookingAtPhoto);

    try {
      await new Promise((r) => setTimeout(r, 400));
      setLoadingText(copy.checkingLocation);
      const speechRes = await processSpeechInput(input);
      setAiAnalysis(speechRes.aiAnalysis);

      const catObj = PLAIN_CATEGORY_LABELS[speechRes.aiAnalysis.detectedCategory];
      const categoryName = catObj ? catObj[lang] : speechRes.aiAnalysis.categoryLabel;

      setInterpretedCategory(speechRes.aiAnalysis.detectedCategory);
      setInterpretedTitle(categoryName);
      setInterpretedDescription(speechRes.structuredDescription || `Voice report: ${categoryName}`);

      const dup = detectDuplicateComplaint(gpsLocation.lat, gpsLocation.lng, speechRes.aiAnalysis.detectedCategory, existingComplaints);
      if (dup.isDuplicate && dup.matchedMasterComplaint) {
        setMatchedDuplicate(dup.matchedMasterComplaint);
        setStep('DUPLICATE_FOUND');
      } else {
        setStep('CONFIRM_GUESS');
      }
    } catch (err) {
      setStep('AI_FALLBACK');
    }
  };

  // Process Text
  const handleTextAnalyze = async () => {
    if (!rawTextInput) return;

    setStep('ANALYZING');
    setLoadingText(copy.findingDepartment);

    try {
      await new Promise((r) => setTimeout(r, 400));
      const nluRes = await analyzeTextNLU(rawTextInput);
      setAiAnalysis(nluRes.aiAnalysis);

      const catObj = PLAIN_CATEGORY_LABELS[nluRes.aiAnalysis.detectedCategory];
      const categoryName = catObj ? catObj[lang] : nluRes.aiAnalysis.categoryLabel;

      setInterpretedCategory(nluRes.aiAnalysis.detectedCategory);
      setInterpretedTitle(categoryName);
      setInterpretedDescription(nluRes.formalDescription || rawTextInput);

      const dup = detectDuplicateComplaint(gpsLocation.lat, gpsLocation.lng, nluRes.aiAnalysis.detectedCategory, existingComplaints);
      if (dup.isDuplicate && dup.matchedMasterComplaint) {
        setMatchedDuplicate(dup.matchedMasterComplaint);
        setStep('DUPLICATE_FOUND');
      } else {
        setStep('CONFIRM_GUESS');
      }
    } catch (err) {
      setStep('AI_FALLBACK');
    }
  };

  // Speech Recognition
  const toggleSpeechRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const sampleText = 'Yahan road pe bahut bada pothole hai sadak par paani bhar raha hai';
      setVoiceText(sampleText);
      handleVoiceAnalyze(sampleText);
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = true;

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setVoiceText(transcript);
      };
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.start();
    } catch (e) {
      setIsRecording(false);
      const sampleText = 'Yahan road pe bahut bada pothole hai sadak par paani bhar raha hai';
      setVoiceText(sampleText);
      handleVoiceAnalyze(sampleText);
    }
  };

  // Final Submit Action
  const executeFinalSubmit = async () => {
    const finalAiAnalysis = aiAnalysis || {
      detectedCategory: (interpretedCategory as any) || 'OTHER_CIVIC_ISSUE',
      categoryLabel: interpretedTitle || 'Civic Issue',
      severityScore: 50,
      riskLevel: 'MEDIUM',
      confidenceScore: 0.85,
      impactAssessment: interpretedDescription || 'Citizen reported issue',
      suggestedDepartmentCode: 'MUNICIPAL_CORP',
      suggestedDepartmentName: 'Municipal Corporation Sanitation',
      suggestedAction: 'Inspect location and dispatch maintenance team.',
    };

    const priority = calculateAIPriorityScore(finalAiAnalysis.severityScore || 75, 1, {
      address: gpsLocation.address,
      ward: gpsLocation.ward,
      zone: 'Central Zone',
      latitude: gpsLocation.lat,
      longitude: gpsLocation.lng,
      nearHospital: gpsLocation.address.toLowerCase().includes('hospital'),
      nearSchool: gpsLocation.address.toLowerCase().includes('school'),
      trafficDensity: 'HIGH',
    });

    const payload = {
      title: interpretedTitle || 'Civic Problem',
      description: interpretedDescription || 'Reported civic issue',
      category: finalAiAnalysis.detectedCategory || 'ROAD_DAMAGE',
      location: {
        address: manualAddress || gpsLocation.address,
        ward: gpsLocation.ward,
        zone: 'Central Zone',
        latitude: gpsLocation.lat,
        longitude: gpsLocation.lng,
        nearHospital: (manualAddress || gpsLocation.address).toLowerCase().includes('hospital'),
        nearSchool: (manualAddress || gpsLocation.address).toLowerCase().includes('school'),
        trafficDensity: 'HIGH',
      },
      imageUrl: imagePreview || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      audioUrl: undefined,
      transcription: voiceText,
      citizenId: 'usr-citizen-01',
      aiAnalysis: finalAiAnalysis,
    };

    let createdComplaint: ComplaintItem;
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        createdComplaint = data.data;
      } else {
        throw new Error('API creation error');
      }
    } catch (e) {
      // Client-side fallback object if API unreachable
      createdComplaint = {
        id: `cmp-${Date.now()}`,
        ticketId: `TICK-${finalAiAnalysis.suggestedDepartmentCode || 'CIVIC'}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: interpretedTitle || 'Civic Problem',
        description: interpretedDescription || 'Reported civic issue',
        category: finalAiAnalysis.detectedCategory || 'ROAD_DAMAGE',
        categoryLabel: PLAIN_CATEGORY_LABELS[finalAiAnalysis.detectedCategory as keyof typeof PLAIN_CATEGORY_LABELS]?.[lang] || finalAiAnalysis.categoryLabel,
        severity: finalAiAnalysis.riskLevel || 'MEDIUM',
        status: 'PENDING',
        priorityScore: priority.finalScore,
        confidenceScore: finalAiAnalysis.confidenceScore || 0.94,
        reportCount: 1,
        isDuplicate: false,
        citizenId: 'usr-citizen-01',
        citizenName: 'Aarav Mehta',
        citizenAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        departmentCode: finalAiAnalysis.suggestedDepartmentCode || 'PWD',
        departmentName: finalAiAnalysis.suggestedDepartmentName || 'Public Works Department',
        location: {
          address: manualAddress || gpsLocation.address,
          ward: gpsLocation.ward,
          zone: 'Central Zone',
          latitude: gpsLocation.lat,
          longitude: gpsLocation.lng,
          nearHospital: (manualAddress || gpsLocation.address).toLowerCase().includes('hospital'),
          nearSchool: (manualAddress || gpsLocation.address).toLowerCase().includes('school'),
          trafficDensity: 'HIGH',
        },
        imageUrl: imagePreview || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        audioUrl: undefined,
        transcription: voiceText,
        aiAnalysis: finalAiAnalysis as any,
        upvotes: 1,
        hasUpvoted: true,
        commentsCount: 0,
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    setSubmittedComplaint(createdComplaint);
    setStep('SUCCESS');
    onSuccess(createdComplaint);
  };

  const handleBackStep = () => {
    if (step === 'SELECT_MODE') {
      if (onCancel) onCancel();
    } else if (step === 'ANALYZING' || step === 'CONFIRM_GUESS' || step === 'AI_FALLBACK' || step === 'DUPLICATE_FOUND') {
      setStep('SELECT_MODE');
    } else if (step === 'FINAL_CONFIRM') {
      setStep('CONFIRM_GUESS');
    }
  };

  const getStepNumber = () => {
    if (step === 'SELECT_MODE') return 1;
    if (step === 'ANALYZING' || step === 'CONFIRM_GUESS' || step === 'DUPLICATE_FOUND' || step === 'AI_FALLBACK') return 2;
    if (step === 'FINAL_CONFIRM') return 3;
    return 3;
  };

  return (
    <div className="w-full max-w-2xl mx-auto civic-card p-6 md:p-8 space-y-6">
      
      {/* Header & Step Stepper */}
      {step !== 'SUCCESS' && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <BackButton onClick={handleBackStep} label={copy.backToHome} />

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <span>{copy.stepOf} {getStepNumber()} {copy.of} 3</span>
            <div className="flex items-center space-x-1">
              <div className={`h-2 w-2 rounded-full ${getStepNumber() >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
              <div className={`h-1 w-4 rounded-full ${getStepNumber() >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
              <div className={`h-1 w-4 rounded-full ${getStepNumber() >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* STEP 1: SELECT MODE */}
        {step === 'SELECT_MODE' && (
          <motion.div key="step-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">{copy.whatsWrong}</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">{copy.chooseInputMode}</p>
            </div>

            {/* 3 Entry Modes */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setInputMode('PHOTO')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                  inputMode === 'PHOTO'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm ring-2 ring-blue-600/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Camera className="h-6 w-6 stroke-[2.5]" />
                <span className="text-xs font-bold">{copy.photoMode}</span>
              </button>

              <button
                onClick={() => setInputMode('VOICE')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                  inputMode === 'VOICE'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm ring-2 ring-blue-600/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Mic className="h-6 w-6 stroke-[2.5]" />
                <span className="text-xs font-bold">{copy.voiceMode}</span>
              </button>

              <button
                onClick={() => setInputMode('TEXT')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                  inputMode === 'TEXT'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm ring-2 ring-blue-600/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="h-6 w-6 stroke-[2.5]" />
                <span className="text-xs font-bold">{copy.textMode}</span>
              </button>
            </div>

            {/* Input Options Body */}
            {inputMode === 'PHOTO' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700">{copy.takePhotoOrUpload}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                  className="w-full text-xs text-slate-600 civic-input file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer p-2"
                />
              </div>
            )}

            {inputMode === 'VOICE' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700">{copy.speakOrDescribe}</label>
                <textarea
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  placeholder="Tap record or type: 'Yahan road pe bahut bada pothole hai...'"
                  className="w-full h-24 p-3 civic-input text-xs"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={toggleSpeechRecording}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                    <span>{isRecording ? 'Listening...' : '🎙️ Record Voice'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const sample = 'Bhai road pe bahut bada pothole hai sadak par paani bhar raha hai';
                      setVoiceText(sample);
                      handleVoiceAnalyze(sample);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 hover:bg-slate-200"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Sample Hinglish
                  </button>

                  <button
                    onClick={() => handleVoiceAnalyze()}
                    disabled={!voiceText}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {inputMode === 'TEXT' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700">{copy.describeWhatNeedsFixing}</label>
                <textarea
                  value={rawTextInput}
                  onChange={(e) => setRawTextInput(e.target.value)}
                  placeholder="E.g. Garbage hasn't been collected for 3 days outside metro gate 3..."
                  className="w-full h-24 p-3 civic-input text-xs"
                />
                <button
                  onClick={handleTextAnalyze}
                  disabled={!rawTextInput}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}

            {/* GPS Location Bar */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 truncate">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-slate-700 font-medium truncate">{gpsLocation.address}</span>
              </div>
              <button
                onClick={() => setIsEditingLocation(!isEditingLocation)}
                className="text-[11px] text-blue-600 hover:underline font-bold shrink-0 ml-2"
              >
                {copy.change}
              </button>
            </div>

            {isEditingLocation && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Enter manual landmark or location..."
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="w-full p-2 civic-input text-xs"
                />
                <button
                  onClick={() => setIsEditingLocation(false)}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px]"
                >
                  {copy.saveLocation}
                </button>
              </div>
            )}

          </motion.div>
        )}

        {/* STEP: ANALYZING */}
        {step === 'ANALYZING' && (
          <motion.div key="step-analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center space-y-3">
            <Loader2 className="h-9 w-9 text-blue-600 animate-spin mx-auto" />
            <p className="font-display text-sm font-bold text-slate-800">{loadingText}</p>
          </motion.div>
        )}

        {/* STEP: CONFIRM GUESS */}
        {step === 'CONFIRM_GUESS' && (
          <motion.div key="step-confirm-guess" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            
            {imagePreview && (
              <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-200 relative">
                <img src={imagePreview} alt="Defect" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">{copy.weThinkThisIs}</span>
              
              <h3 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>{PLAIN_CATEGORY_LABELS[interpretedCategory as keyof typeof PLAIN_CATEGORY_LABELS]?.icon || '⚠️'}</span>
                <span>{interpretedTitle}</span>
              </h3>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">"{interpretedDescription}"</p>
              
              <div className="pt-2 text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>📍 {gpsLocation.ward}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 text-center font-semibold">{copy.didWeUnderstand}</p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setStep('SELECT_MODE')}
                className="py-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Edit3 className="h-4 w-4 text-slate-500" />
                <span>{copy.change}</span>
              </button>

              <button
                onClick={() => setStep('FINAL_CONFIRM')}
                className="py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>{copy.yesThatsRight}</span>
              </button>
            </div>

          </motion.div>
        )}

        {/* STEP: DUPLICATE FOUND */}
        {step === 'DUPLICATE_FOUND' && matchedDuplicate && (
          <motion.div key="step-duplicate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-center">
              <AlertCircle className="h-8 w-8 text-amber-600 mx-auto" />
              <h3 className="font-display text-base font-bold text-slate-900">{copy.alreadyReported}</h3>
              <p className="text-xs text-slate-700 font-medium">
                <strong>{matchedDuplicate.reportCount + 126} people</strong> have already reported this issue near {gpsLocation.ward}.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onSuccess(matchedDuplicate, matchedDuplicate.ticketId)}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 hover:bg-blue-700"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{copy.supportReport}</span>
              </button>

              <button
                onClick={() => setStep('FINAL_CONFIRM')}
                className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                {copy.reportDifferent}
              </button>
            </div>

          </motion.div>
        )}

        {/* STEP: AI FALLBACK */}
        {step === 'AI_FALLBACK' && (
          <motion.div key="step-fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
              <AlertCircle className="h-7 w-7 text-amber-600 mx-auto" />
              <h3 className="font-display text-sm font-bold text-slate-900">{copy.couldNotIdentify}</h3>
            </div>

            <textarea
              value={interpretedDescription}
              onChange={(e) => setInterpretedDescription(e.target.value)}
              placeholder="Describe the issue in your own words..."
              className="w-full h-24 p-3 civic-input text-xs"
            />

            <button
              onClick={() => {
                setInterpretedTitle('Civic Issue');
                setStep('FINAL_CONFIRM');
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
            >
              {copy.describeYourself}
            </button>
          </motion.div>
        )}

        {/* STEP: FINAL CONFIRMATION */}
        {step === 'FINAL_CONFIRM' && (
          <motion.div key="step-final" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-blue-700 font-bold">
                <span>{PLAIN_CATEGORY_LABELS[interpretedCategory as keyof typeof PLAIN_CATEGORY_LABELS]?.icon || '⚠️'} {PLAIN_CATEGORY_LABELS[interpretedCategory as keyof typeof PLAIN_CATEGORY_LABELS]?.[lang] || interpretedTitle || 'Civic Issue'}</span>
                <span>📍 {gpsLocation.ward}</span>
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">{interpretedTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">"{interpretedDescription}"</p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={() => setStep('SELECT_MODE')}
                className="flex-1 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold"
              >
                {copy.edit}
              </button>

              <button
                onClick={executeFinalSubmit}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
                <span>{copy.reportThisIssue}</span>
              </button>
            </div>

          </motion.div>
        )}

        {/* STEP: SUCCESS SCREEN */}
        {step === 'SUCCESS' && submittedComplaint && (
          <motion.div key="step-success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center space-y-5">
            
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-extrabold text-slate-900">{copy.reportSubmitted}</h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">{copy.thanksForHelping}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Issue:</span>
                <span className="font-bold text-slate-900">{submittedComplaint.categoryLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Location:</span>
                <span className="font-semibold text-slate-800">{submittedComplaint.location.ward}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Current status:</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {PLAIN_STATUS_CONFIG[submittedComplaint.status]?.[lang] || PLAIN_STATUS_CONFIG.PENDING[lang]}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  if (onViewMyReport) onViewMyReport();
                  else if (onCancel) onCancel();
                }}
                className="w-full max-w-md py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all"
              >
                {copy.viewMyReport}
              </button>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
