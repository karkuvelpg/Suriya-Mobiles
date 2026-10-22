"use client";

import { useState } from "react";
import {
  Wrench,
  Plus,
  Search,
  Smartphone,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Phone,
  Calendar,
  Printer,
} from "lucide-react";
import { formatINR } from "@/lib/finance";
import { INITIAL_REPAIRS, RepairJob } from "@/lib/mock-data";

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<RepairJob[]>(INITIAL_REPAIRS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);

  // New Job Sheet Form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [imeiNumber, setImeiNumber] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deviceModel || !issueDescription) return;

    const newJob: RepairJob = {
      id: `rep-${Date.now()}`,
      jobId: `JOB-26-${Math.floor(100 + Math.random() * 900)}`,
      customerName,
      customerPhone,
      deviceModel,
      imeiNumber: imeiNumber || "N/A (Accessory/Battery)",
      issueDescription,
      estimatedCostPaise: Math.round(parseFloat(estimatedCost || "0") * 100),
      advancePaidPaise: Math.round(parseFloat(advancePaid || "0") * 100),
      status: "RECEIVED",
      createdAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }),
      expectedDelivery: "2-3 days",
      technicianNotes: "Device received at service desk.",
    };

    setRepairs([newJob, ...repairs]);
    setShowNewJobModal(false);
    // Reset
    setCustomerName("");
    setCustomerPhone("");
    setDeviceModel("");
    setImeiNumber("");
    setIssueDescription("");
    setEstimatedCost("");
    setAdvancePaid("");
  };

  const updateStatus = (jobId: string, newStatus: RepairJob["status"]) => {
    setRepairs((prev) =>
      prev.map((r) => (r.id === jobId ? { ...r, status: newStatus } : r))
    );
  };

  const filtered = repairs.filter((r) => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchSearch =
      r.jobId.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerPhone.includes(search) ||
      r.deviceModel.toLowerCase().includes(search.toLowerCase()) ||
      r.imeiNumber.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Mobile Repair & Service Lounge
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Job sheet ticketing, technician remarks, spare part management & customer SMS/WhatsApp tracking
          </p>
        </div>

        <button
          onClick={() => setShowNewJobModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Repair Job Sheet</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Job #, customer phone, device model, IMEI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/80 bg-card/60 focus:bg-background text-xs font-medium focus:border-primary focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-border/80 bg-card/60 text-xs font-medium focus:outline-none text-foreground"
        >
          <option value="all">All Statuses</option>
          <option value="RECEIVED">Received</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING_PARTS">Waiting for Parts</option>
          <option value="COMPLETED">Completed (Ready)</option>
          <option value="DELIVERED">Delivered</option>
        </select>
      </div>

      {/* Repair Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((job) => (
          <div
            key={job.id}
            className="flex flex-col justify-between p-5 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div>
              {/* Job Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <span className="font-mono font-bold text-xs text-sky-400">{job.jobId}</span>
                <select
                  value={job.status}
                  onChange={(e) => updateStatus(job.id, e.target.value as any)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                    job.status === "COMPLETED"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : job.status === "IN_PROGRESS"
                      ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  }`}
                >
                  <option value="RECEIVED" className="bg-popover text-foreground">RECEIVED</option>
                  <option value="IN_PROGRESS" className="bg-popover text-foreground">IN_PROGRESS</option>
                  <option value="WAITING_PARTS" className="bg-popover text-foreground">WAITING_PARTS</option>
                  <option value="COMPLETED" className="bg-popover text-foreground">COMPLETED</option>
                  <option value="DELIVERED" className="bg-popover text-foreground">DELIVERED</option>
                </select>
              </div>

              {/* Device and Customer info */}
              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2">
                  <Smartphone className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{job.deviceModel}</h3>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      IMEI: {job.imeiNumber}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Issue Reported:
                  </p>
                  <p className="font-medium text-foreground">{job.issueDescription}</p>
                </div>

                {job.technicianNotes && (
                  <p className="text-[11px] text-muted-foreground italic">
                    Note: {job.technicianNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Financial and Customer footer */}
            <div className="pt-3 border-t border-border/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">{job.customerName}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{job.customerPhone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs text-foreground">
                    Est: {formatINR(job.estimatedCostPaise)}
                  </p>
                  <p className="text-[10px] text-emerald-400">
                    Adv: {formatINR(job.advancePaidPaise)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-[10px] text-muted-foreground">
                <span>Due: {job.expectedDelivery}</span>
                <button
                  onClick={() => setSelectedJob(job)}
                  className="font-semibold text-sky-400 hover:underline flex items-center gap-1"
                >
                  <Printer className="w-3 h-3" /> Print Job Ticket
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Job Sheet Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setShowNewJobModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-lg text-foreground">Create Service Job Sheet</h3>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senthil Nathan"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9840123456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Device Model
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 14 Pro"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    15-Digit IMEI / Serial
                  </label>
                  <input
                    type="text"
                    placeholder="358291048291048"
                    value={imeiNumber}
                    onChange={(e) => setImeiNumber(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                  Fault / Issue Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Broken display, touch ghosting, camera lens scratched"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 4500"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Advance Paid (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md"
                >
                  Create & Print Job Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Job Sheet Ticket */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-3 border-b border-dashed border-border text-xs space-y-1">
              <h2 className="font-black text-sm uppercase">Suriya Mobiles Service Lounge</h2>
              <p className="text-[10px] text-muted-foreground">Ph: +91 98401 99999 • Anna Nagar</p>
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold text-[10px]">
                SERVICE TOKEN: {selectedJob.jobId}
              </span>
            </div>

            <div className="py-3 border-b border-dashed border-border text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Device:</span>
                <span className="font-bold text-foreground">{selectedJob.deviceModel}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">IMEI:</span>
                <span>{selectedJob.imeiNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span>{selectedJob.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimate:</span>
                <span>{formatINR(selectedJob.estimatedCostPaise)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Advance Paid:</span>
                <span>{formatINR(selectedJob.advancePaidPaise)}</span>
              </div>
            </div>

            <div className="pt-3 text-[9px] text-center text-muted-foreground">
              Please present this ticket during device delivery. Data backup responsibility lies with the customer.
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
