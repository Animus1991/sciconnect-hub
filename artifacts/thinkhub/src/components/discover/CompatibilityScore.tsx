import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { User, Star, Users, BookOpen, ArrowRight } from "lucide-react";

interface Researcher {
  id: string;
  name: string;
  title: string;
  institution: string;
  field: string;
  expertise: string[];
  publications: number;
  citations: number;
  hIndex: number;
  avatar: string;
  availableForCollab?: boolean;
  followers?: number;
}

interface CompatibilityScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function CompatibilityScore({ score, size = "md", showLabel = true }: CompatibilityScoreProps) {
  const sizeConfig = {
    sm: { width: 32, height: 32, radius: 12, strokeWidth: 2 },
    md: { width: 40, height: 40, radius: 15, strokeWidth: 2.5 },
    lg: { width: 48, height: 48, radius: 18, strokeWidth: 3 }
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return "#22c55e"; // emerald
    if (score >= 60) return "#3b82f6"; // blue
    if (score >= 40) return "#f59e0b"; // amber
    return "#6b7280"; // gray
  };

  const color = getColor(score);

  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <svg width={config.width} height={config.height} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={config.strokeWidth}
          />
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <span 
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-xs font-medium" style={{ color }}>
            {score}% match
          </span>
          <span className="text-xs text-muted-foreground">
            {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Low'}
          </span>
        </div>
      )}
    </div>
  );
}

interface ResearcherCardProps {
  researcher: Researcher;
  myProfile?: {
    skills?: Array<{ name: string; level: number }>;
    interests?: string[];
    availableForCollab?: boolean;
  };
  onFollow?: (researcherId: string) => void;
  onContact?: (researcherId: string) => void;
  isFollowing?: boolean;
}

export function ResearcherCard({ 
  researcher, 
  myProfile, 
  onFollow, 
  onContact,
  isFollowing = false 
}: ResearcherCardProps) {
  // Calculate compatibility score
  const calculateCompatibility = (): number => {
    if (!myProfile) return Math.floor(Math.random() * 40) + 60; // Random 60-100 for demo

    let score = 0;
    const mySkills = new Set(
      (myProfile.skills || []).map(s => s.name.toLowerCase())
    );
    const myInterests = new Set((myProfile.interests || []).map(i => i.toLowerCase()));

    // Expertise overlap (40% weight)
    const expertiseOverlap = researcher.expertise
      .filter(e => mySkills.has(e.toLowerCase()) || myInterests.has(e.toLowerCase()))
      .length;
    score += Math.min(40, expertiseOverlap * 10);

    // Academic impact (30% weight)
    if (researcher.hIndex >= 20) score += 15;
    else if (researcher.hIndex >= 10) score += 10;
    else if (researcher.hIndex >= 5) score += 5;

    if (researcher.citations >= 1000) score += 15;
    else if (researcher.citations >= 500) score += 10;
    else if (researcher.citations >= 100) score += 5;

    // Collaboration availability (20% weight)
    if (researcher.availableForCollab && myProfile.availableForCollab) {
      score += 20;
    } else if (researcher.availableForCollab) {
      score += 10;
    }

    // Field alignment (10% weight)
    if (myInterests.has(researcher.field.toLowerCase())) {
      score += 10;
    }

    return Math.min(100, score);
  };

  const compatibilityScore = calculateCompatibility();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold">
                {researcher.avatar}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {researcher.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {researcher.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {researcher.institution} · {researcher.field}
                  </p>
                </div>

                {/* Compatibility Score */}
                <CompatibilityScore score={compatibilityScore} size="sm" showLabel={false} />
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {researcher.expertise.slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {researcher.expertise.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{researcher.expertise.length - 4}
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {researcher.publications} papers
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {researcher.citations} citations
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">h-index: {researcher.hIndex}</span>
                </div>
                {researcher.followers && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {researcher.followers}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onFollow?.(researcher.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isFollowing
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                
                {researcher.availableForCollab && (
                  <button
                    onClick={() => onContact?.(researcher.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-accent transition-colors flex items-center gap-1"
                  >
                    Contact
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {compatibilityScore >= 80 && (
                  <Badge variant="default" className="text-xs">
                    Excellent Match
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
