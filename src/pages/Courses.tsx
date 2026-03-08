import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { GraduationCap, Search, Clock, Users, Star, Play, BookOpen, Award, CheckCircle2, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

const courses = [
  {
    id: "c1", title: "Advanced Machine Learning for Scientific Research",
    instructor: "Prof. Marcus Chen", institution: "Stanford",
    level: "Advanced", duration: "8 weeks", enrolled: 1240, rating: 4.9,
    modules: 12, completedModules: 0, progress: 0,
    tags: ["ML", "Deep Learning", "Research Methods"],
    description: "Master neural network architectures, optimization techniques, and their application to scientific discovery.",
    category: "AI & ML", featured: true,
  },
  {
    id: "c2", title: "Research Methods & Experimental Design",
    instructor: "Dr. Sofia Reyes", institution: "Barcelona",
    level: "Intermediate", duration: "6 weeks", enrolled: 892, rating: 4.8,
    modules: 8, completedModules: 5, progress: 62,
    tags: ["Methodology", "Statistics", "Experimental Design"],
    description: "Learn to design rigorous experiments, analyze data, and draw valid conclusions from your research.",
    category: "Methodology", featured: false,
  },
  {
    id: "c3", title: "Scientific Writing & Publishing",
    instructor: "Prof. Omar Hassan", institution: "ETH Zürich",
    level: "Beginner", duration: "4 weeks", enrolled: 2341, rating: 4.7,
    modules: 6, completedModules: 6, progress: 100,
    tags: ["Writing", "Publishing", "Career"],
    description: "From structuring your manuscript to navigating peer review — a complete guide to scientific publishing.",
    category: "Career", featured: true,
  },
  {
    id: "c4", title: "Quantum Computing Fundamentals",
    instructor: "Dr. Lisa Park", institution: "Caltech",
    level: "Intermediate", duration: "10 weeks", enrolled: 567, rating: 4.6,
    modules: 14, completedModules: 3, progress: 21,
    tags: ["Quantum", "Physics", "Computing"],
    description: "Introduction to quantum gates, circuits, algorithms, and the principles of quantum error correction.",
    category: "Quantum", featured: false,
  },
  {
    id: "c5", title: "Grant Writing Masterclass",
    instructor: "Dr. Elena Vasquez", institution: "MIT",
    level: "Beginner", duration: "3 weeks", enrolled: 1567, rating: 4.9,
    modules: 5, completedModules: 0, progress: 0,
    tags: ["Grants", "Funding", "Career"],
    description: "Learn to write compelling NIH, NSF, and ERC grant proposals with proven strategies from successful PIs.",
    category: "Career", featured: true,
  },
  {
    id: "c6", title: "Bioinformatics & Genomic Analysis",
    instructor: "Dr. Yuki Tanaka", institution: "University of Tokyo",
    level: "Advanced", duration: "12 weeks", enrolled: 423, rating: 4.5,
    modules: 16, completedModules: 0, progress: 0,
    tags: ["Bioinformatics", "Genomics", "Data Science"],
    description: "Comprehensive pipeline for genomic data analysis, from sequencing reads to biological interpretation.",
    category: "Biology", featured: false,
  },
];

const levelStyles: Record<string, string> = {
  Beginner: "text-emerald-brand bg-emerald-muted border-emerald-brand/30",
  Intermediate: "text-info bg-info/10 border-info/30",
  Advanced: "text-highlight bg-highlight/10 border-highlight/30",
};

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set(["c2", "c3", "c4"]));

  const toggleEnroll = (id: string, title: string) => {
    setEnrolled(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info(`Unenrolled from ${title}`); }
      else { next.add(id); toast.success(`Enrolled in ${title}`); }
      return next;
    });
  };

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filteredCourses = useMemo(() => {
    if (!debouncedSearch.trim()) return courses;
    const q = debouncedSearch.toLowerCase();
    return courses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q)) ||
      c.category.toLowerCase().includes(q)
    );
  }, [debouncedSearch]);

  const myCourses = courses.filter(c => enrolled.has(c.id));
  const completedCount = myCourses.filter(c => c.progress === 100).length;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Learning Hub</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Courses, workshops, and resources to advance your research skills
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Available", value: String(courses.length), icon: BookOpen, color: "text-foreground" },
            { label: "Enrolled", value: String(enrolled.size), icon: GraduationCap, color: "text-accent" },
            { label: "Completed", value: String(completedCount), icon: CheckCircle2, color: "text-emerald-brand" },
            { label: "Avg Rating", value: "4.7", icon: Star, color: "text-gold" },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4">
              <s.icon className={`w-4 h-4 mb-2 ${s.color}`} />
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>

        <Tabs defaultValue="browse">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="browse" className="font-display text-sm">Browse Courses</TabsTrigger>
            <TabsTrigger value="my-courses" className="font-display text-sm">My Courses ({enrolled.size})</TabsTrigger>
            <TabsTrigger value="completed" className="font-display text-sm">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by title, instructor, or topic..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border">
                  <GraduationCap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground font-display">No courses match your search</p>
                </div>
              ) : filteredCourses.map((course, i) => (
                <motion.div key={course.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 hover:shadow-scholarly transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] font-display ${levelStyles[course.level]}`}>{course.level}</Badge>
                      {course.featured && (
                        <Badge variant="outline" className="text-[9px] font-display text-gold border-gold/30 bg-gold-muted">Featured</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-display">
                      <Star className="w-3 h-3 text-gold fill-gold" /> {course.rating}
                    </div>
                  </div>

                  <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">{course.title}</h3>
                  <p className="text-xs text-muted-foreground font-display mb-1">{course.instructor} · {course.institution}</p>
                  <p className="text-xs text-muted-foreground font-display leading-relaxed mb-3 line-clamp-2">{course.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {course.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px] font-display">{tag}</Badge>)}
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {course.modules} modules</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrolled.toLocaleString()}</span>
                  </div>

                  {enrolled.has(course.id) && course.progress > 0 && (
                    <div className="flex items-center gap-3 mb-3">
                      <Progress value={course.progress} className="h-1.5 flex-1" />
                      <span className="text-[11px] text-muted-foreground font-display font-medium">{course.progress}%</span>
                    </div>
                  )}

                  <button onClick={(e) => { e.stopPropagation(); toggleEnroll(course.id, course.title); }}
                    className={`w-full h-8 rounded-lg text-xs font-display font-semibold transition-all flex items-center justify-center gap-1 ${
                      enrolled.has(course.id)
                        ? "bg-success/10 text-success hover:bg-success/20"
                        : "bg-accent text-accent-foreground hover:opacity-90"
                    }`}>
                    {enrolled.has(course.id)
                      ? (course.progress > 0 ? <><Play className="w-3 h-3" /> Continue</> : <><CheckCircle2 className="w-3 h-3" /> Enrolled</>)
                      : "Enroll Now"
                    }
                  </button>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-courses" className="space-y-3">
            {myCourses.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-display font-semibold text-foreground mb-2">No enrolled courses</h3>
                <p className="text-sm text-muted-foreground font-display">Browse the catalog and enroll in courses that interest you.</p>
              </div>
            ) : myCourses.filter(c => c.progress < 100).map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground text-sm group-hover:text-accent transition-colors">{course.title}</h3>
                    <p className="text-[11px] text-muted-foreground font-display">{course.instructor} · Module {course.completedModules}/{course.modules}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Progress value={course.progress} className="h-1.5 flex-1" />
                      <span className="text-[11px] text-muted-foreground font-display font-medium">{course.progress}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="completed">
            {myCourses.filter(c => c.progress === 100).length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-display font-semibold text-foreground mb-2">No completed courses yet</h3>
                <p className="text-sm text-muted-foreground font-display max-w-md mx-auto">Complete enrolled courses to earn certificates and track your learning progress.</p>
              </div>
            ) : myCourses.filter(c => c.progress === 100).map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground text-sm">{course.title}</h3>
                  <p className="text-[11px] text-muted-foreground font-display">{course.instructor} · {course.modules} modules completed</p>
                </div>
                <Badge variant="outline" className="text-[10px] font-display text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                  <Award className="w-3 h-3 mr-0.5" /> Certificate
                </Badge>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Courses;
