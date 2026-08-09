import { ComplaintItem, IssueCategory, Status } from './types';

export type SupportedLanguage = 'en' | 'hi' | 'hinglish';

export const PLAIN_CATEGORY_LABELS: Record<IssueCategory, { en: string; hi: string; hinglish: string; icon: string }> = {
  ROAD_DAMAGE: { en: 'Road Damage & Pothole', hi: 'सड़क का गड्ढा / खराबी', hinglish: 'Road damage / Sadak gaddha', icon: '🛣️' },
  GARBAGE_OVERFLOW: { en: 'Garbage & Waste Overflow', hi: 'कचरा / सफाई की समस्या', hinglish: 'Kachra overflow / Garbage', icon: '🗑️' },
  WATER_LEAKAGE: { en: 'Water Leakage & Overflow', hi: 'पानी की लीकेज / सप्लाई', hinglish: 'Paani leak / Water issue', icon: '💧' },
  BROKEN_STREETLIGHT: { en: 'Broken Streetlight / Wire', hi: 'स्ट्रीटलाइट / बिजली तार', hinglish: 'Streetlight kharab / Bijli', icon: '💡' },
  TRAFFIC_SIGNAL_FAILURE: { en: 'Traffic Light Failure', hi: 'ट्रैफिक सिग्नल खराबी', hinglish: 'Traffic signal kharab', icon: '🚥' },
  ILLEGAL_DUMPING: { en: 'Illegal Debris & Waste Dumping', hi: 'अवैध मलबा / कचरा', hinglish: 'Illegal malba dumping', icon: '🏗️' },
  ELECTRIC_POLE_DAMAGE: { en: 'Damaged Electric Pole / Wire', hi: 'बिजली का खंभा / तार', hinglish: 'Electric pole kharab', icon: '⚡' },
  DRAINAGE_PROBLEM: { en: 'Blocked Drain & Waterlogging', hi: 'नाली बंद / जलभराव', hinglish: 'Naali jaam / Paani bhara', icon: '🌊' },
  WALL_DAMAGE: { en: 'Damaged Boundary Wall', hi: 'दीवार खराबी / क्षति', hinglish: 'Deewar tootna / Damage', icon: '🧱' },
  CONSTRUCTION_WASTE: { en: 'Construction Debris', hi: 'निर्माण सामग्री का कचरा', hinglish: 'Construction malba', icon: '🚧' },
  ANIMAL_HAZARD: { en: 'Stray Animal Safety Risk', hi: 'आवारा पशु समस्या', hinglish: 'Stray animal hazard', icon: '🐕' },
  OTHER_CIVIC_ISSUE: { en: 'Civic Problem', hi: 'अन्य नागरिक समस्या', hinglish: 'Other civic problem', icon: '⚠️' },
};

export const PLAIN_STATUS_CONFIG: Record<Status, { en: string; hi: string; hinglish: string; label: string; badgeClass: string; stepIndex: number }> = {
  PENDING: {
    en: 'Received',
    hi: 'प्राप्त हुआ',
    hinglish: 'Received',
    label: 'Received',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 font-semibold',
    stepIndex: 1,
  },
  MERGED_DUPLICATE: {
    en: 'Supported',
    hi: 'समर्थित',
    hinglish: 'Supported',
    label: 'Supported',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 font-semibold',
    stepIndex: 1,
  },
  ASSIGNED: {
    en: 'Assigned to team',
    hi: 'टीम को सौंपा गया',
    hinglish: 'Team ko assign kiya',
    label: 'Assigned to team',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 font-semibold',
    stepIndex: 2,
  },
  IN_PROGRESS: {
    en: 'Work Started',
    hi: 'काम शुरू हो गया है',
    hinglish: 'Kaam chalu ho gaya',
    label: 'Work Started',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
    stepIndex: 3,
  },
  CITIZEN_VERIFICATION: {
    en: 'Awaiting your verification',
    hi: 'आपके सत्यापन की प्रतीक्षा है',
    hinglish: 'Aapke confirm karne ka wait hai',
    label: 'Awaiting your verification',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
    stepIndex: 4,
  },
  RESOLVED: {
    en: 'Resolved',
    hi: 'समाधान हो गया',
    hinglish: 'Problem thik ho gayi',
    label: 'Resolved',
    badgeClass: 'bg-green-100 text-green-800 border-green-300 font-semibold',
    stepIndex: 5,
  },
  REJECTED: {
    en: 'Closed',
    hi: 'बंद कर दिया गया',
    hinglish: 'Closed ho gaya',
    label: 'Closed',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 font-semibold',
    stepIndex: 0,
  },
};

export const CITIZEN_TIMELINE_STEPS = [
  { step: 1, name: 'Reported', key: 'PENDING' },
  { step: 2, name: 'Received', key: 'ASSIGNED' },
  { step: 3, name: 'Assigned', key: 'ASSIGNED' },
  { step: 4, name: 'Work Started', key: 'IN_PROGRESS' },
  { step: 5, name: 'Resolved', key: 'RESOLVED' },
  { step: 6, name: 'Citizen Verified', key: 'CITIZEN_VERIFICATION' },
];

/**
 * Transforms technical AI metrics into a plain-language summary for citizens.
 * E.g., "This was marked urgent because it's near a school and several people reported it."
 */
export function getCitizenPlainReason(complaint: ComplaintItem, lang: SupportedLanguage = 'en'): string {
  const isUrgent = complaint.priorityScore >= 75 || complaint.severity === 'CRITICAL' || complaint.severity === 'HIGH';
  const hasMultipleReports = complaint.reportCount > 1;
  const isNearSchool = complaint.location.nearSchool;
  const isNearHospital = complaint.location.nearHospital;
  const isHighTraffic = complaint.location.trafficDensity === 'HIGH';

  const reasons: string[] = [];
  if (isNearSchool) {
    reasons.push(lang === 'hi' ? 'यह स्कूल के पास है' : lang === 'hinglish' ? 'yeh school ke paas hai' : "it's near a school");
  }
  if (isNearHospital) {
    reasons.push(lang === 'hi' ? 'यह अस्पताल के पास है' : lang === 'hinglish' ? 'yeh hospital ke paas hai' : "it's near a hospital");
  }
  if (hasMultipleReports) {
    reasons.push(
      lang === 'hi'
        ? `${complaint.reportCount} नागरिकों ने इसकी रिपोर्ट की है`
        : lang === 'hinglish'
        ? `${complaint.reportCount} logon ne report kiya hai`
        : `${complaint.reportCount} people have reported it`
    );
  }
  if (isHighTraffic && !isNearSchool && !isNearHospital) {
    reasons.push(lang === 'hi' ? 'यह व्यस्त सड़क पर है' : lang === 'hinglish' ? 'busy road pe hai' : "it's on a busy road");
  }

  if (reasons.length === 0) {
    return lang === 'hi'
      ? 'आपकी रिपोर्ट दर्ज हो गई है और संबंधित टीम को भेज दी गई है।'
      : lang === 'hinglish'
      ? 'Aapki report submit ho gayi hai aur team ko bhej di gayi hai.'
      : 'Your report has been received and routed for action.';
  }

  const reasonStr = reasons.join(lang === 'en' ? ' and ' : ' aur ');

  if (isUrgent) {
    return lang === 'hi'
      ? `इस समस्या को प्राथमिकता दी गई है क्योंकि ${reasonStr}।`
      : lang === 'hinglish'
      ? `Is problem ko urgent mark kiya gaya hai kyunki ${reasonStr}.`
      : `This was marked urgent because ${reasonStr}.`;
  }

  return lang === 'hi'
    ? `आपकी रिपोर्ट ध्यानपूर्वक दर्ज की गई है क्योंकि ${reasonStr}।`
    : lang === 'hinglish'
    ? `Aapki report note ho gayi hai kyunki ${reasonStr}.`
    : `Your report has been received because ${reasonStr}.`;
}

/**
 * Full UI Copy mappings for EN, HI, Hinglish
 */
export const UI_COPY = {
  en: {
    reportProblem: 'Report a Problem',
    nearbyIssues: 'Nearby Issues',
    myReports: 'My Reports',
    home: 'Home',
    map: 'Map',
    profile: 'Profile',
    whatsWrong: "What's wrong?",
    chooseInputMode: 'Choose how you want to share the problem',
    photoMode: 'Photo',
    voiceMode: 'Voice',
    textMode: 'Text',
    stepOf: 'Step',
    of: 'of',
    looksLike: 'Looks like',
    didWeUnderstand: 'Did we understand you correctly?',
    yesThatsRight: "Yes, that's right",
    edit: 'Edit',
    change: 'Change',
    reportThisIssue: 'Report this issue',
    alreadyReported: 'This problem has already been reported.',
    supportReport: 'Support this report',
    reportDifferent: 'Report a different problem',
    couldNotIdentify: "We couldn't identify the problem.",
    describeYourself: 'Describe it yourself',
    hasBeenFixed: 'Has this problem been fixed?',
    yesFixed: "Yes, it's fixed",
    noStillThere: "No, it's still there",
    whosHandling: "Who's handling it?",
    lookingAtPhoto: 'Looking at your photo…',
    checkingLocation: 'Checking the location…',
    findingDepartment: 'Finding the right department…',
    askCivicLens: 'Ask Civic Lens',
    takePhotoOrUpload: 'Take a photo or upload an image',
    speakOrDescribe: 'Speak or describe in Hindi / Hinglish / English',
    describeWhatNeedsFixing: 'Describe what needs fixing',
    saveLocation: 'Save Location',
    weThinkThisIs: 'We think this is:',
    reportSubmitted: 'Report submitted ✓',
    thanksForHelping: 'Thanks for helping improve your neighborhood.',
    viewMyReport: 'View My Report',
    statusProgress: 'Status Progress',
    assignedWorker: 'Assigned Worker',
    locationAndWard: 'Location & Ward',
    communityReports: 'Community Reports',
    reportedDefectPhoto: 'Reported Defect Photo',
    resolutionProofPhoto: 'Resolution Proof Photo',
    workInProgress: 'Work in progress. Resolution photo will appear here when completed.',
    communityNotes: 'Community Notes',
    addNoteOrComment: 'Add a note or comment...',
    cityProblemMap: 'City Problem Map',
    viewReportedCivicIssues: 'View reported civic issues in your area',
    backToHome: 'Back to Home',
    backToMyReports: 'Back to My Reports',
    citizenProfile: 'Citizen Profile',
    communityPoints: 'Community Points',
    neighborhoodGuardian: 'Neighborhood Guardian',
    preferredLanguage: 'Preferred Language',
    notificationsAlerts: 'Notifications & Alerts',
    enabled: 'Enabled',
    roleSwitcherDemo: 'Role Switcher (Demo Mode)',
    assistantWelcome: 'Namaste! I am your Civic Lens Assistant. Ask me about your report status, assigned workers, or city repair updates.',
    askAnythingChatbot: 'Ask anything about your reports...',
    activeReports: 'active reports',
  },
  hi: {
    reportProblem: 'समस्या की रिपोर्ट करें',
    nearbyIssues: 'आस-पास की समस्याएं',
    myReports: 'मेरी रिपोर्टें',
    home: 'होम',
    map: 'मैप',
    profile: 'प्रोफ़ाइल',
    whatsWrong: 'क्या समस्या है?',
    chooseInputMode: 'चुनें कि आप समस्या कैसे साझा करना चाहते हैं',
    photoMode: 'फोटो',
    voiceMode: 'आवाज',
    textMode: 'टेक्स्ट',
    stepOf: 'चरण',
    of: 'का',
    looksLike: 'ऐसा लग रहा है कि',
    didWeUnderstand: 'क्या हमने सही समझा?',
    yesThatsRight: 'हाँ, यह सही है',
    edit: 'संशोधन करें',
    change: 'बदलें',
    reportThisIssue: 'समस्या सबमिट करें',
    alreadyReported: 'इस समस्या की पहले ही रिपोर्ट की जा चुकी है।',
    supportReport: 'इस रिपोर्ट का समर्थन करें',
    reportDifferent: 'दूसरी समस्या की रिपोर्ट करें',
    couldNotIdentify: 'हम समस्या पहचान नहीं सके।',
    describeYourself: 'खुद विवरण लिखें',
    hasBeenFixed: 'क्या यह समस्या हल हो गई है?',
    yesFixed: 'हाँ, ठीक हो गया है',
    noStillThere: 'नहीं, अभी भी समस्या है',
    whosHandling: 'कौन देख रहा है?',
    lookingAtPhoto: 'आपकी फोटो देखी जा रही है…',
    checkingLocation: 'लोकेशन जांची जा रही है…',
    findingDepartment: 'विभाग चुना जा रहा है…',
    askCivicLens: 'Civic Lens से पूछें',
    takePhotoOrUpload: 'फोटो खींचें या इमेज अपलोड करें',
    speakOrDescribe: 'हिंदी, हिंग्लिश या अंग्रेजी में बोलें या लिखें',
    describeWhatNeedsFixing: 'बताएं कि क्या ठीक करने की आवश्यकता है',
    saveLocation: 'स्थान सुरक्षित करें',
    weThinkThisIs: 'हमें लगता है कि यह समस्या है:',
    reportSubmitted: 'रिपोर्ट सबमिट हो गई ✓',
    thanksForHelping: 'अपने पड़ोस को बेहतर बनाने में मदद के लिए धन्यवाद।',
    viewMyReport: 'मेरी रिपोर्ट देखें',
    statusProgress: 'स्थिति की प्रगति',
    assignedWorker: 'सौंपा गया कर्मचारी',
    locationAndWard: 'स्थान और वार्ड',
    communityReports: 'नागरिक रिपोर्टें',
    reportedDefectPhoto: 'रिपोर्ट की गई फोटो',
    resolutionProofPhoto: 'समाधान की फोटो',
    workInProgress: 'काम जारी है। काम पूरा होने पर फोटो यहां दिखाई देगी।',
    communityNotes: 'नागरिक टिप्पणियां',
    addNoteOrComment: 'टिप्पणी या नोट जोड़ें...',
    cityProblemMap: 'शहर की समस्या का मैप',
    viewReportedCivicIssues: 'अपने क्षेत्र की दर्ज की गई समस्याएं देखें',
    backToHome: 'होम पर वापस जाएं',
    backToMyReports: 'मेरी रिपोर्ट पर वापस जाएं',
    citizenProfile: 'नागरिक प्रोफाइल',
    communityPoints: 'समुदाय अंक',
    neighborhoodGuardian: 'पड़ोस का रक्षक',
    preferredLanguage: 'पसंदीदा भाषा',
    notificationsAlerts: 'सूचनाएं और अलर्ट',
    enabled: 'चालू',
    roleSwitcherDemo: 'रोल स्विच (डेमो मोड)',
    assistantWelcome: 'नमस्ते! मैं आपका सिविक लेंस सहायक हूँ। मुझसे अपनी रिपोर्ट की स्थिति या शहर की मरम्मत के बारे में पूछें।',
    askAnythingChatbot: 'अपनी रिपोर्टों के बारे में कुछ भी पूछें...',
    activeReports: 'सक्रिय रिपोर्टें',
  },
  hinglish: {
    reportProblem: 'Report a Problem',
    nearbyIssues: 'Pass ki Problems',
    myReports: 'Meri Reports',
    home: 'Home',
    map: 'Map',
    profile: 'Profile',
    whatsWrong: 'Kya problem hai?',
    chooseInputMode: 'Choose karo aap kaise problem share karna chahte ho',
    photoMode: 'Photo',
    voiceMode: 'Voice',
    textMode: 'Text',
    stepOf: 'Step',
    of: 'of',
    looksLike: 'Aisa lag raha hai',
    didWeUnderstand: 'Kya humne sahi samjha?',
    yesThatsRight: 'Haan, sahi hai',
    edit: 'Edit karo',
    change: 'Change karo',
    reportThisIssue: 'Report submit karo',
    alreadyReported: 'Yeh problem pehle se reported hai.',
    supportReport: 'Support karo is report ko',
    reportDifferent: 'Dusri problem report karo',
    couldNotIdentify: 'Hum problem pehchan nahi paye.',
    describeYourself: 'Khud likho kya problem hai',
    hasBeenFixed: 'Kya yeh problem thik ho gayi hai?',
    yesFixed: 'Haan, thik ho gayi',
    noStillThere: 'Nahi, abhi bhi problem hai',
    whosHandling: 'Kaun handle kar raha hai?',
    lookingAtPhoto: 'Photo check kar rahe hain…',
    checkingLocation: 'Location check kar rahe hain…',
    findingDepartment: 'Department find kar rahe hain…',
    askCivicLens: 'Ask Civic Lens',
    takePhotoOrUpload: 'Photo khincho ya image upload karo',
    speakOrDescribe: 'Hindi, Hinglish ya English me bolo ya likho',
    describeWhatNeedsFixing: 'Bataiye kya thik karna hai',
    saveLocation: 'Location save karo',
    weThinkThisIs: 'Humko lagta hai yeh problem hai:',
    reportSubmitted: 'Report submit ho gayi ✓',
    thanksForHelping: 'Apne neighborhood ko behtar banane me help ke liye dhanyawad.',
    viewMyReport: 'Meri Report dekho',
    statusProgress: 'Status Progress',
    assignedWorker: 'Assigned Worker',
    locationAndWard: 'Location & Ward',
    communityReports: 'Community Reports',
    reportedDefectPhoto: 'Reported Defect Photo',
    resolutionProofPhoto: 'Resolution Proof Photo',
    workInProgress: 'Kaam chalu hai. Kaam pura hone par photo yahan dikhegi.',
    communityNotes: 'Community Notes',
    addNoteOrComment: 'Note ya comment add karo...',
    cityProblemMap: 'City Problem Map',
    viewReportedCivicIssues: 'Apne area ki reported civic issues dekho',
    backToHome: 'Back to Home',
    backToMyReports: 'Back to My Reports',
    citizenProfile: 'Citizen Profile',
    communityPoints: 'Community Points',
    neighborhoodGuardian: 'Neighborhood Guardian',
    preferredLanguage: 'Preferred Language',
    notificationsAlerts: 'Notifications & Alerts',
    enabled: 'Enabled',
    roleSwitcherDemo: 'Role Switcher (Demo Mode)',
    assistantWelcome: 'Namaste! Main aapka Civic Lens Assistant hoon. Apni report status ya repair updates ke baare me pucho.',
    askAnythingChatbot: 'Apni reports ke baare me kuch bhi pucho...',
    activeReports: 'active reports',
  },
};
