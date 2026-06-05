import {
    careNavigationPathways,
    careNavigationGovernanceChecklist,
    sampleCareNavigationCalls,
  } from "../data/careNavigation";
  
  export function getDefaultCareNavigationPathways() {
    return careNavigationPathways;
  }
  
  export function getDefaultCareNavigationGovernanceChecklist() {
    return careNavigationGovernanceChecklist;
  }
  
  export function getDefaultSampleCareNavigationCalls() {
    return sampleCareNavigationCalls;
  }
  
  export function filterCareNavigationPathways(pathways, searchTerm, statusFilter) {
    const safePathways = Array.isArray(pathways)
      ? pathways
      : careNavigationPathways;
  
    const safeSearchTerm = String(searchTerm || "").toLowerCase();
  
    return safePathways.filter((pathway) => {
      const searchText = `${pathway.name || ""} ${pathway.source || ""} ${
        pathway.owner || ""
      } ${pathway.description || ""}`.toLowerCase();
  
      const matchesSearch = searchText.includes(safeSearchTerm);
  
      const matchesStatus =
        statusFilter === "All" || pathway.status === statusFilter;
  
      return matchesSearch && matchesStatus;
    });
  }
  
  export function getCareNavigationPathwayById(pathways, pathwayId) {
    const safePathways = Array.isArray(pathways)
      ? pathways
      : careNavigationPathways;
  
    return (
      safePathways.find((pathway) => pathway.id === pathwayId) || safePathways[0]
    );
  }
  
  export function getCareNavigationMetrics(pathways = careNavigationPathways) {
    const safePathways = Array.isArray(pathways)
      ? pathways
      : careNavigationPathways;
  
    const draftPathways = safePathways.filter(
      (pathway) => pathway.status === "Draft"
    );
  
    const lockedPathways = safePathways.filter(
      (pathway) => pathway.status === "Locked"
    );
  
    const approvedPathways = safePathways.filter(
      (pathway) => pathway.status === "Approved"
    );
  
    const retiredPathways = safePathways.filter(
      (pathway) => pathway.status === "Retired"
    );
  
    const highRiskPathways = safePathways.filter(
      (pathway) => pathway.risk === "High"
    );
  
    const clinicallyUnsafePathways = safePathways.filter(
      (pathway) =>
        pathway.risk === "High" ||
        pathway.status === "Draft" ||
        pathway.status === "Locked" ||
        String(pathway.reviewStatus || "").toLowerCase().includes("required")
    );
  
    return {
      totalPathways: safePathways.length,
      draftPathways,
      lockedPathways,
      approvedPathways,
      retiredPathways,
      highRiskPathways,
      clinicallyUnsafePathways,
    };
  }
  
  export function getInitialClinicType(pathway) {
    return pathway?.suggestedClinicTypes?.[0] || "Not selected";
  }
  
  export function buildSystmOneNote({
    selectedPathway,
    presentingRequest,
    duration,
    knownIssue,
    selectedClinicType,
    supportingAction,
    redFlagSummary,
    additionalNotes,
  }) {
    return [
      "Care navigation telephone note:",
      "Contact type: Telephone / reception care navigation",
      `Presenting request: ${presentingRequest || "(not entered)"}`,
      `Selected pathway: ${selectedPathway.name} (${selectedPathway.version})`,
      `Duration: ${duration || "(not entered)"}`,
      `Recurring / known issue: ${knownIssue}`,
      `Selected clinic type: ${selectedClinicType}`,
      `Supporting action: ${supportingAction}`,
      "",
      "Red-flag section:",
      redFlagSummary || "(No red-flag responses entered in prototype)",
      "",
      "Additional notes:",
      additionalNotes || "(none entered)",
      "",
      "Safety status:",
      "Prototype only — pathway not approved for real patient use.",
    ].join("\n");
  }
  
  export function getPathwaySafetyStatus(pathway) {
    if (!pathway) {
      return {
        label: "Not selected",
        detail: "No pathway selected.",
        risk: "High",
      };
    }
  
    if (pathway.status === "Locked") {
      return {
        label: "Locked",
        detail: "This pathway is locked and should not be used.",
        risk: "High",
      };
    }
  
    if (pathway.status === "Draft") {
      return {
        label: "Draft",
        detail: "This pathway requires clinical review before use.",
        risk: pathway.risk || "High",
      };
    }
  
    if (pathway.status === "Approved") {
      return {
        label: "Approved",
        detail:
          "This pathway is marked approved in mock data, but production governance is still required.",
        risk: pathway.risk || "Medium",
      };
    }
  
    return {
      label: pathway.status || "Unknown",
      detail: "Pathway status requires review.",
      risk: pathway.risk || "Medium",
    };
  }
  
  export function getGovernanceChecklistMetrics(
    checklist = careNavigationGovernanceChecklist
  ) {
    const safeChecklist = Array.isArray(checklist)
      ? checklist
      : careNavigationGovernanceChecklist;
  
    const requiredItems = safeChecklist.filter((item) => item.status === "Required");
    const completedItems = safeChecklist.filter((item) => item.status === "Complete");
    const plannedItems = safeChecklist.filter((item) => item.status === "Planned");
  
    return {
      requiredItems,
      completedItems,
      plannedItems,
      totalItems: safeChecklist.length,
    };
  }