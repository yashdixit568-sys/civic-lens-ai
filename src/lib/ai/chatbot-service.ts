import { ComplaintItem } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  ticketReference?: string;
  timestamp: string;
}

/**
 * Handles conversational queries from citizens or municipal staff.
 */
export async function getAIChatbotResponse(
  userQuery: string,
  userComplaints: ComplaintItem[]
): Promise<ChatMessage> {
  await new Promise((res) => setTimeout(res, 650));

  const queryLower = userQuery.toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Check if query asks for status or ticket ID
  const ticketMatch = userQuery.match(/TICK-[A-Z0-9-]+/i);
  let targetComplaint = ticketMatch
    ? userComplaints.find((c) => c.ticketId.toUpperCase() === ticketMatch[0].toUpperCase())
    : userComplaints[0];

  if (queryLower.includes('why is my complaint pending') || queryLower.includes('pending') || queryLower.includes('delay')) {
    if (targetComplaint) {
      return {
        id: `chat-${Date.now()}`,
        sender: 'AI',
        text: `Your complaint **${targetComplaint.ticketId}** (${targetComplaint.title}) is currently in **${targetComplaint.status}** status assigned to **${targetComplaint.departmentName}**. The AI priority score is **${targetComplaint.priorityScore}/100**. ${
          targetComplaint.assignedEngineerName
            ? `Assigned engineer **${targetComplaint.assignedEngineerName}** is scheduled for site dispatch within the SLA period.`
            : 'The department head is selecting an engineer for dispatch.'
        }`,
        ticketReference: targetComplaint.ticketId,
        timestamp,
      };
    }
  }

  if (queryLower.includes('where is my complaint') || queryLower.includes('status') || queryLower.includes('track')) {
    if (targetComplaint) {
      return {
        id: `chat-${Date.now()}`,
        sender: 'AI',
        text: `Ticket **${targetComplaint.ticketId}** is located at **${targetComplaint.location.address} (${targetComplaint.location.ward})**. Current Status: **${targetComplaint.status}**. Reported by **${targetComplaint.reportCount}** citizen(s). Target resolution SLA: 48 hours.`,
        ticketReference: targetComplaint.ticketId,
        timestamp,
      };
    }
  }

  if (queryLower.includes('department') || queryLower.includes('who handles')) {
    return {
      id: `chat-${Date.now()}`,
      sender: 'AI',
      text: `Civic Lens AI automatically routes issues based on category:\n- **Road Damage**: Public Works Department (PWD)\n- **Garbage & Waste**: Municipal Sanitation Corp\n- **Water Leaks**: Water Supply Department\n- **Streetlights & Wires**: Electricity Department\n- **Drainage & Flooding**: Drainage & Sewerage Dept`,
      timestamp,
    };
  }

  if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('bhai') || queryLower.includes('help')) {
    return {
      id: `chat-${Date.now()}`,
      sender: 'AI',
      text: `Namaste! I am your Civic Lens AI Assistant. You can ask me:\n1. *"Where is my complaint TICK-ROAD-9821?"*\n2. *"Why is my ticket pending?"*\n3. *"Which department handles water leakage?"*\n4. *"How does citizen reputation score work?"*`,
      timestamp,
    };
  }

  // Default response
  return {
    id: `chat-${Date.now()}`,
    sender: 'AI',
    text: `Thank you for reaching out to Civic Lens AI intelligence services. I have checked your active reports in **${
      targetComplaint?.location.ward || 'your ward'
    }**. Ticket **${targetComplaint?.ticketId || 'TICK-8841'}** is set to **${
      targetComplaint?.severity || 'HIGH'
    }** severity with priority score **${targetComplaint?.priorityScore || 85}/100**. Is there a specific detail you would like me to retrieve?`,
    timestamp,
  };
}
