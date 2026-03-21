import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Building2, Users, BookOpen, Quote, TrendingUp, Settings, ChevronRight,
  Search, Filter, MoreHorizontal, Shield, AlertTriangle, CheckCircle,
  FileText, BarChart3, Globe, Download, Plus, Mail, UserCheck, Clock,
  Star, Database
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ── Mock data ── */
const STATS = [
  { label: "Total Members", value: "1,247", delta: "+18 this month", icon: Users, color: "text-primary" },
  { label: "Publications", value: "8,431", delta: "+142 this month", icon: BookOpen, color: "text-success" },
  { label: "Total Citations", value: "284K", delta: "+12,400 this month", icon: Quote, color: "text-gold" },
  { label: "Active Projects", value: "63", delta: "+7 this month", icon: Database, color: "text-info" },
];

const DEPARTMENTS = [
  { name: "Computer Science", members: 312, publications: 2140, citations: 98400, openAccess: 78 },
  { name: "Physics", members: 187, publications: 1890, citations: 71200, openAccess: 65 },
  { name: "Biomedical Engineering", members: 144, publications: 1240, citations: 45600, openAccess: 82 },
  { name: "Mathematics", members: 98, publications: 870, citations: 23100, openAccess: 91 },
  { name: "Chemistry", members: 201, publications: 1430, citations: 34800, openAccess: 69 },
  { name: "Environmental Science", members: 112, publications: 640, citations: 18200, openAccess: 87 },
];

const MEMBERS = [
  { id: "m1", name: "Dr. Sarah Chen", role: "Faculty", dept: "Computer Science", status: "active", publications: 47, joined: "Sep 2021", verified: true },
  { id: "m2", name: "Prof. James Liu", role: "Faculty", dept: "Physics", status: "active", publications: 62, joined: "Jan 2019", verified: true },
  { id: "m3", name: "Dr. Ana Gomez", role: "Postdoc", dept: "Biomedical Engineering", status: "active", publications: 18, joined: "Apr 2023", verified: true },
  { id: "m4", name: "Marcus Webb", role: "PhD Student", dept: "Mathematics", status: "pending", publications: 3, joined: "Sep 2024", verified: false },
  { id: "m5", name: "Dr. Priya Nair", role: "Faculty", dept: "Chemistry", status: "active", publications: 35, joined: "Aug 2020", verified: true },
  { id: "m6", name: "Tom Okonkwo", role: "PhD Student", dept: "Environmental Science", status: "active", publications: 7, joined: "Sep 2023", verified: true },
  { id: "m7", name: "Dr. Lena Fischer", role: "Research Scientist", dept: "Computer Science", status: "inactive", publications: 23, joined: "Feb 2022", verified: true },
  { id: "m8", name: "James Park", role: "Postdoc", dept: "Physics", status: "pending", publications: 9, joined: "Nov 2024", verified: false },
];

const ACTIVITY = [
  { type: "publication", text: "Dr. Sarah Chen submitted a new paper to Nature AI", time: "2h ago", icon: BookOpen },
  { type: "member", text: "Marcus Webb completed onboarding — PhD Student (Mathematics)", time: "4h ago", icon: UserCheck },
  { type: "review", text: "Prof. James Liu accepted a peer review assignment", time: "6h ago", icon: CheckCircle },
  { type: "alert", text: "2 membership verification requests pending approval", time: "8h ago", icon: AlertTriangle },
  { type: "publication", text: "Biomedical Engineering dept crossed 1,200 total publications", time: "1d ago", icon: Star },
  { type: "member", text: "Dr. Lena Fischer account flagged as inactive (90+ days)", time: "2d ago", icon: Clock },
];

/* ── Stat card ── */
function StatCard({ stat }: { stat: typeof STATS[number] }) {
  const Icon = stat.icon;
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
        <div className={cn("w-7 h-7 rounded-lg bg-muted flex items-center justify-center", stat.color)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-xl font-semibold mb-1">{stat.value}</p>
      <p className="text-xs text-success">{stat.delta}</p>
    </div>
  );
}

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-success/10 text-success border-success/20" },
    pending: { label: "Pending", className: "bg-gold/10 text-gold border-gold/20" },
    inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-border" },
  };
  const { label, className } = map[status] ?? map.inactive;
  return <Badge variant="outline" className={cn("text-[10px] font-medium", className)}>{label}</Badge>;
}

/* ── Main page ── */
const AdminDashboard = () => {
  const [memberSearch, setMemberSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredMembers = MEMBERS.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.dept.toLowerCase().includes(memberSearch.toLowerCase());
    const matchRole = roleFilter === "all" || m.role.toLowerCase().includes(roleFilter);
    return matchSearch && matchRole;
  });

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto py-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">Institution Dashboard</h1>
                <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Beta</Badge>
              </div>
              <p className="text-sm text-muted-foreground">MIT — Administrative portal for institution admins</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export Report
            </Button>
            <Button size="sm" className="h-8 text-xs rounded-lg gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Invite Members
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STATS.map(stat => <StatCard key={stat.label} stat={stat} />)}
        </div>

        {/* Main content */}
        <Tabs defaultValue="members">
          <TabsList className="mb-6">
            <TabsTrigger value="members" className="text-xs">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Members
            </TabsTrigger>
            <TabsTrigger value="departments" className="text-xs">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Compliance
            </TabsTrigger>
          </TabsList>

          {/* Members tab */}
          <TabsContent value="members">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2 flex-1 bg-muted/50 rounded-lg px-3 py-1.5">
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <input
                    className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    placeholder="Search members..."
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                  />
                </div>
                <select
                  className="text-xs bg-muted/50 border border-border/50 rounded-lg px-2.5 py-1.5 outline-none text-foreground"
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                >
                  <option value="all">All roles</option>
                  <option value="faculty">Faculty</option>
                  <option value="postdoc">Postdoc</option>
                  <option value="phd">PhD Student</option>
                  <option value="research">Research Scientist</option>
                </select>
                <Badge variant="secondary" className="text-[10px]">
                  {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {/* Pending verification notice */}
              {MEMBERS.filter(m => !m.verified).length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2.5 bg-gold/5 border-b border-gold/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-gold shrink-0" />
                  <p className="text-xs text-gold font-medium">
                    {MEMBERS.filter(m => !m.verified).length} member{MEMBERS.filter(m => !m.verified).length > 1 ? "s" : ""} awaiting identity verification
                  </p>
                  <Button variant="outline" size="sm" className="h-6 text-[10px] rounded-md ml-auto border-gold/30 text-gold hover:bg-gold/10">
                    Review
                  </Button>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-4 py-2.5">Member</th>
                      <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-3 py-2.5 hidden sm:table-cell">Role</th>
                      <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-3 py-2.5 hidden md:table-cell">Department</th>
                      <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-3 py-2.5">Status</th>
                      <th className="text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-4 py-2.5 hidden lg:table-cell">Pubs</th>
                      <th className="text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(m => (
                      <tr key={m.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                              {m.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium truncate">{m.name}</p>
                                {m.verified && <CheckCircle className="w-3 h-3 text-success shrink-0" />}
                              </div>
                              <p className="text-[10px] text-muted-foreground">Joined {m.joined}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">{m.role}</span>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">{m.dept}</span>
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={m.status} />
                        </td>
                        <td className="px-4 py-3 text-right hidden lg:table-cell">
                          <span className="text-xs font-medium">{m.publications}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-md">
                              <Mail className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-md">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredMembers.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">No members match your search</div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Departments tab */}
          <TabsContent value="departments">
            <div className="space-y-3">
              {DEPARTMENTS.map(dept => (
                <div key={dept.name} className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold">{dept.name}</p>
                      <p className="text-xs text-muted-foreground">{dept.members} members</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg">
                      View dept <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Publications</p>
                      <p className="text-sm font-semibold">{dept.publications.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Citations</p>
                      <p className="text-sm font-semibold">{(dept.citations / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Open Access</p>
                      <div className="flex items-center gap-2">
                        <Progress value={dept.openAccess} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium">{dept.openAccess}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Activity tab */}
          <TabsContent value="activity">
            <div className="bg-card rounded-xl border border-border divide-y divide-border/40">
              {ACTIVITY.map((item, i) => {
                const Icon = item.icon;
                const iconColor = item.type === "alert" ? "text-gold" : item.type === "member" ? "text-primary" : "text-muted-foreground";
                return (
                  <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                    <div className={cn("mt-0.5 shrink-0", iconColor)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Compliance tab */}
          <TabsContent value="compliance">
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">GDPR & Data Compliance</h3>
                <div className="space-y-3">
                  {[
                    { label: "Data Processing Agreement", status: "Signed", ok: true },
                    { label: "Privacy Policy (EU)", status: "Current — v2.4", ok: true },
                    { label: "Researcher Consent Records", status: "1,247 / 1,247 obtained", ok: true },
                    { label: "Data Export Requests", status: "3 pending (< 30 days)", ok: false },
                    { label: "Erasure Requests", status: "0 pending", ok: true },
                    { label: "Blockchain Data Transparency", status: "Disclosed in Privacy Policy", ok: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <p className="text-sm">{item.label}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{item.status}</span>
                        {item.ok
                          ? <CheckCircle className="w-3.5 h-3.5 text-success" />
                          : <AlertTriangle className="w-3.5 h-3.5 text-gold" />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Open Access Compliance</h3>
                <div className="flex items-center gap-4 mb-2">
                  <Progress value={76} className="flex-1 h-2" />
                  <span className="text-sm font-semibold shrink-0">76% Open Access</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  6,387 of 8,431 publications are fully open access. Target: 85% by end of 2026.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
};

export default AdminDashboard;
