package com.audit.platform.dto;

public class DashboardResponse {

    // Audit counts
    private long totalAudits;
    private long plannedAudits;
    private long inProgressAudits;
    private long completedAudits;
    private long closedAudits;

    // Finding counts
    private long totalFindings;
    private long openFindings;
    private long inProgressFindings;
    private long resolvedFindings;
    private long closedFindings;
    private long criticalFindings;
    private long majorFindings;
    private long minorFindings;

    // Corrective Action counts
    private long totalCorrectiveActions;
    private long openCorrectiveActions;
    private long inProgressCorrectiveActions;
    private long completedCorrectiveActions;
    private long verifiedCorrectiveActions;
    private long closedCorrectiveActions;
    private long overdueCorrectiveActions;

    // Verification counts
    private long totalVerifications;
    private long pendingVerifications;
    private long approvedVerifications;
    private long rejectedVerifications;

    public DashboardResponse() {
    }

    public long getTotalAudits() {
        return totalAudits;
    }

    public void setTotalAudits(long totalAudits) {
        this.totalAudits = totalAudits;
    }

    public long getPlannedAudits() {
        return plannedAudits;
    }

    public void setPlannedAudits(long plannedAudits) {
        this.plannedAudits = plannedAudits;
    }

    public long getInProgressAudits() {
        return inProgressAudits;
    }

    public void setInProgressAudits(long inProgressAudits) {
        this.inProgressAudits = inProgressAudits;
    }

    public long getCompletedAudits() {
        return completedAudits;
    }

    public void setCompletedAudits(long completedAudits) {
        this.completedAudits = completedAudits;
    }

    public long getClosedAudits() {
        return closedAudits;
    }

    public void setClosedAudits(long closedAudits) {
        this.closedAudits = closedAudits;
    }

    public long getTotalFindings() {
        return totalFindings;
    }

    public void setTotalFindings(long totalFindings) {
        this.totalFindings = totalFindings;
    }

    public long getOpenFindings() {
        return openFindings;
    }

    public void setOpenFindings(long openFindings) {
        this.openFindings = openFindings;
    }

    public long getInProgressFindings() {
        return inProgressFindings;
    }

    public void setInProgressFindings(long inProgressFindings) {
        this.inProgressFindings = inProgressFindings;
    }

    public long getResolvedFindings() {
        return resolvedFindings;
    }

    public void setResolvedFindings(long resolvedFindings) {
        this.resolvedFindings = resolvedFindings;
    }

    public long getClosedFindings() {
        return closedFindings;
    }

    public void setClosedFindings(long closedFindings) {
        this.closedFindings = closedFindings;
    }

    public long getCriticalFindings() {
        return criticalFindings;
    }

    public void setCriticalFindings(long criticalFindings) {
        this.criticalFindings = criticalFindings;
    }

    public long getMajorFindings() {
        return majorFindings;
    }

    public void setMajorFindings(long majorFindings) {
        this.majorFindings = majorFindings;
    }

    public long getMinorFindings() {
        return minorFindings;
    }

    public void setMinorFindings(long minorFindings) {
        this.minorFindings = minorFindings;
    }

    public long getTotalCorrectiveActions() {
        return totalCorrectiveActions;
    }

    public void setTotalCorrectiveActions(long totalCorrectiveActions) {
        this.totalCorrectiveActions = totalCorrectiveActions;
    }

    public long getOpenCorrectiveActions() {
        return openCorrectiveActions;
    }

    public void setOpenCorrectiveActions(long openCorrectiveActions) {
        this.openCorrectiveActions = openCorrectiveActions;
    }

    public long getInProgressCorrectiveActions() {
        return inProgressCorrectiveActions;
    }

    public void setInProgressCorrectiveActions(long inProgressCorrectiveActions) {
        this.inProgressCorrectiveActions = inProgressCorrectiveActions;
    }

    public long getCompletedCorrectiveActions() {
        return completedCorrectiveActions;
    }

    public void setCompletedCorrectiveActions(long completedCorrectiveActions) {
        this.completedCorrectiveActions = completedCorrectiveActions;
    }

    public long getVerifiedCorrectiveActions() {
        return verifiedCorrectiveActions;
    }

    public void setVerifiedCorrectiveActions(long verifiedCorrectiveActions) {
        this.verifiedCorrectiveActions = verifiedCorrectiveActions;
    }

    public long getClosedCorrectiveActions() {
        return closedCorrectiveActions;
    }

    public void setClosedCorrectiveActions(long closedCorrectiveActions) {
        this.closedCorrectiveActions = closedCorrectiveActions;
    }

    public long getOverdueCorrectiveActions() {
        return overdueCorrectiveActions;
    }

    public void setOverdueCorrectiveActions(long overdueCorrectiveActions) {
        this.overdueCorrectiveActions = overdueCorrectiveActions;
    }

    public long getTotalVerifications() {
        return totalVerifications;
    }

    public void setTotalVerifications(long totalVerifications) {
        this.totalVerifications = totalVerifications;
    }

    public long getPendingVerifications() {
        return pendingVerifications;
    }

    public void setPendingVerifications(long pendingVerifications) {
        this.pendingVerifications = pendingVerifications;
    }

    public long getApprovedVerifications() {
        return approvedVerifications;
    }

    public void setApprovedVerifications(long approvedVerifications) {
        this.approvedVerifications = approvedVerifications;
    }

    public long getRejectedVerifications() {
        return rejectedVerifications;
    }

    public void setRejectedVerifications(long rejectedVerifications) {
        this.rejectedVerifications = rejectedVerifications;
    }
}
