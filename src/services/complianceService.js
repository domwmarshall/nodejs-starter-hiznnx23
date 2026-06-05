import {
    policies,
    staffPolicyAcknowledgements,
    policyQuestionExamples,
  } from "../data/compliance";
  
  import { daysUntil, getReviewStatus } from "../utils/dateUtils";
  
  export function getDefaultPolicies() {
    return policies;
  }
  
  export function enrichPolicies(policyList = policies) {
    const safePolicies = Array.isArray(policyList) ? policyList : policies;
  
    return safePolicies.map((policy) => ({
      ...policy,
      computedStatus: getReviewStatus(policy.reviewDue, policy.status),
      daysUntilReview: daysUntil(policy.reviewDue),
    }));
  }
  
  export function filterPolicies(policyList, searchTerm, statusFilter) {
    const safePolicies = Array.isArray(policyList) ? policyList : [];
    const safeSearchTerm = String(searchTerm || "").toLowerCase();
  
    return safePolicies.filter((policy) => {
      const searchText = `${policy.name || ""} ${policy.category || ""} ${
        policy.owner || ""
      } ${policy.summary || ""}`.toLowerCase();
  
      const matchesSearch = searchText.includes(safeSearchTerm);
  
      const matchesStatus =
        statusFilter === "All" || policy.computedStatus === statusFilter;
  
      return matchesSearch && matchesStatus;
    });
  }
  
  export function getPolicyById(policyList, policyId) {
    const enrichedPolicies = enrichPolicies(policyList);
  
    return (
      enrichedPolicies.find((policy) => policy.id === policyId) ||
      enrichedPolicies[0]
    );
  }
  
  export function getComplianceMetrics(policyList = policies) {
    const enrichedPolicies = enrichPolicies(policyList);
  
    const overduePolicies = enrichedPolicies.filter(
      (policy) => policy.computedStatus === "Overdue"
    );
  
    const dueSoonPolicies = enrichedPolicies.filter(
      (policy) => policy.computedStatus === "Due soon"
    );
  
    const approvedPolicies = enrichedPolicies.filter(
      (policy) => policy.computedStatus === "Approved"
    );
  
    const averageAcknowledgement = Math.round(
      enrichedPolicies.reduce(
        (total, policy) => total + Number(policy.acknowledgement || 0),
        0
      ) / enrichedPolicies.length
    );
  
    const governanceAlerts = enrichedPolicies.filter(
      (policy) =>
        policy.computedStatus === "Overdue" ||
        policy.computedStatus === "Due soon" ||
        policy.acknowledgement < 90 ||
        policy.risk === "High"
    );
  
    return {
      enrichedPolicies,
      overduePolicies,
      dueSoonPolicies,
      approvedPolicies,
      averageAcknowledgement,
      governanceAlerts,
    };
  }
  
  export function getPolicyAcknowledgements(policyId) {
    return staffPolicyAcknowledgements.filter(
      (item) => item.policyId === policyId
    );
  }
  
  export function getPolicyQuestions(policyId) {
    return policyQuestionExamples.filter(
      (question) => question.policyId === policyId
    );
  }