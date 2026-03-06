import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { GraduationCap, Users, MessageCircle, Star, ChevronRight, Search, Plus, Award, BookOpen, Calendar, MapPin, Building2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mentors = [
  {
    name: "Prof. Margaret Chen",
    title: "Full Professor of Computer Science",
    institution: "Stanford University",
    fields: ["AI", "Machine Learning", "NLP"],
    rating: 4.9,
    reviews: 23,
    mentees: 8,
    initials: "MC",
    available: true,
  },
  {
    name: "Dr. James Okafor",
    title: "Associate Professor of Neuroscience",
    institution: "UCL",
    fields: ["Neuroscience", "Brain Imaging", "fMRI"],
    rating: 4.8,
    reviews: 15,
    mentees: 5,
    initials: "JO",
    available: true,
  },
  {
    name: "Prof. Yuki Tanaka",
    title: "Professor of Quantum Physics",
    institution: "University of Tokyo",
    fields: ["Quantum Computing", "Condensed Matter"],
    rating: 4.7,
    reviews: 31,
    mentees: 12,
    initials: "YT",
    available: false,
  },
];

const programs = [
  {
    title: "Early Career Researcher Mentorship",
    organizer: "SciHub Community",
    duration: "6 months",
    startDate: "Sep 2026",
    spots: "12/20",
    level: "PhD Students",
    description: "Pair with senior researchers for career guidance, paper writing, and grant applications.",
  },
  {
    title: "Industry-Academia Bridge Program",
    organizer: "MIT & Google Research",
    duration: "3 months",
    startDate: "Jun 2026",
    spots: "5/10",
    level: "Postdocs",
    description: "Connect academic researchers with industry leaders for translational research partnerships.",
  },
  {
    title: "Teaching Excellence Workshop",
    organizer: "SciHub Education",
    duration: "4 weeks",
    startDate: "Apr 2026",
    spots: "28/30",
    level: "All Levels",
    description: "Master evidence-based teaching methods, course design, and student engagement strategies.",
  },
];

const Mentorship = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Mentorship</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Find mentors, join programs, and advance your academic career
              </p>
            </div>
            <button className="flex items-center gap-2 h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Become a Mentor
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: "Active Mentors", value: "340+", icon: GraduationCap },
            { label: "Active Mentees", value: "1.2K", icon: Users },
            { label: "Programs", value: "8", icon: Award },
            { label: "Success Stories", value: "95%", icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
              <stat.icon className="w-4 h-4 mb-2 text-accent" />
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <Tabs defaultValue="mentors">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="mentors" className="font-display text-sm">Find Mentors</TabsTrigger>
            <TabsTrigger value="programs" className="font-display text-sm">Programs</TabsTrigger>
            <TabsTrigger value="my-mentors" className="font-display text-sm">My Mentors</TabsTrigger>
          </TabsList>

          <TabsContent value="mentors">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, field, or institution..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="space-y-3">
              {mentors.map((mentor, i) => (
                <motion.div
                  key={mentor.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-sm font-semibold">
                        {mentor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                          {mentor.name}
                        </h3>
                        {mentor.available ? (
                          <Badge variant="outline" className="text-[10px] font-display text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-display text-muted-foreground">
                            Waitlist
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-display mb-1">{mentor.title}</p>
                      <p className="text-xs text-muted-foreground font-display flex items-center gap-1 mb-2">
                        <Building2 className="w-3 h-3" /> {mentor.institution}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex gap-1.5">
                          {mentor.fields.map((field) => (
                            <Badge key={field} variant="secondary" className="text-[10px] font-display">{field}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-display ml-auto">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-accent fill-accent" /> {mentor.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {mentor.mentees} mentees
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="h-8 px-3 rounded-lg bg-accent text-accent-foreground text-xs font-display font-semibold hover:opacity-90 transition-opacity flex-shrink-0">
                      Request
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-4">
            {programs.map((program, i) => (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="text-[10px] font-display text-blue-400 border-blue-500/20 bg-blue-500/10">
                    {program.level}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-display">{program.spots} spots</span>
                </div>
                <h3 className="font-serif text-base font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                  {program.title}
                </h3>
                <p className="text-xs text-muted-foreground font-display mb-3">{program.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {program.organizer}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {program.duration}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Starts {program.startDate}</span>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="my-mentors" className="bg-card rounded-xl border border-border p-8 text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-display font-semibold text-foreground mb-2">No active mentorships</h3>
            <p className="text-sm text-muted-foreground font-display max-w-md mx-auto mb-4">
              Connect with experienced researchers who can guide your career, review your work, and open doors to new opportunities.
            </p>
            <button className="h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">
              Browse Mentors
            </button>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Mentorship;
