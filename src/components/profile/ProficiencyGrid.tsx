import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Code, 
  Database, 
  BrainCircuit, 
  FlaskConical, 
  BarChart2, 
  BookOpen,
  Cpu,
  Microscope,
  Dna,
  Atom,
  Globe,
  Calculator
} from "lucide-react";

interface Skill {
  name: string;
  level: number;
  category: string;
  icon?: any;
  description?: string;
}

interface ProficiencyGridProps {
  skills?: Skill[];
  compact?: boolean;
}

const categoryIcons: Record<string, any> = {
  "Programming": Code,
  "Methods": BrainCircuit,
  "Specialization": Cpu,
  "Research": Microscope,
  "Analysis": BarChart2,
  "Database": Database,
  "Machine Learning": BrainCircuit,
  "Biology": Dna,
  "Chemistry": FlaskConical,
  "Physics": Atom,
  "Mathematics": Calculator,
  "Languages": Globe,
  "Tools": BookOpen
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Programming": "bg-blue-500/10 text-blue-600 border-blue-200",
    "Methods": "bg-purple-500/10 text-purple-600 border-purple-200", 
    "Specialization": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    "Research": "bg-orange-500/10 text-orange-600 border-orange-200",
    "Analysis": "bg-pink-500/10 text-pink-600 border-pink-200",
    "Database": "bg-cyan-500/10 text-cyan-600 border-cyan-200",
    "Machine Learning": "bg-violet-500/10 text-violet-600 border-violet-200",
    "Biology": "bg-green-500/10 text-green-600 border-green-200",
    "Chemistry": "bg-indigo-500/10 text-indigo-600 border-indigo-200",
    "Physics": "bg-red-500/10 text-red-600 border-red-200",
    "Mathematics": "bg-amber-500/10 text-amber-600 border-amber-200",
    "Languages": "bg-teal-500/10 text-teal-600 border-teal-200",
    "Tools": "bg-slate-500/10 text-slate-600 border-slate-200"
  };
  return colors[category] || "bg-gray-500/10 text-gray-600 border-gray-200";
};

const getProgressColor = (level: number) => {
  if (level >= 90) return "bg-emerald-500";
  if (level >= 75) return "bg-blue-500";
  if (level >= 60) return "bg-amber-500";
  return "bg-gray-400";
};

const getSkillLevelLabel = (level: number) => {
  if (level >= 90) return "Expert";
  if (level >= 75) return "Advanced";
  if (level >= 60) return "Intermediate";
  if (level >= 40) return "Basic";
  return "Beginner";
};

export function ProficiencyGrid({ skills = [], compact = false }: ProficiencyGridProps) {
  // Default skills if none provided
  const defaultSkills: Skill[] = [
    { name: "Python", level: 95, category: "Programming", description: "Data analysis, ML, scientific computing" },
    { name: "Machine Learning", level: 92, category: "Methods", description: "Deep learning, classical ML, reinforcement learning" },
    { name: "Deep Learning", level: 85, category: "Specialization", description: "Transformers, CNNs, RNNs, GANs" },
    { name: "R / Statistics", level: 88, category: "Programming", description: "Statistical analysis, data visualization" },
    { name: "Bayesian Analysis", level: 78, category: "Methods", description: "Bayesian inference, MCMC, hierarchical models" },
    { name: "Transformer Architecture", level: 90, category: "Specialization", description: "Attention mechanisms, BERT, GPT models" },
    { name: "NLP / LLMs", level: 88, category: "Specialization", description: "Text processing, language models, embeddings" },
    { name: "Quantum Computing", level: 65, category: "Research", description: "Qiskit, quantum algorithms, quantum ML" },
    { name: "Data Visualization", level: 82, category: "Analysis", description: "Matplotlib, Plotly, D3.js, Tableau" },
    { name: "SQL / Databases", level: 75, category: "Database", description: "PostgreSQL, MongoDB, data engineering" }
  ];

  const skillsToDisplay = skills.length > 0 ? skills : defaultSkills;
  
  // Group skills by category
  const skillsByCategory = skillsToDisplay.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (compact) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(skillsByCategory).map(([category, categorySkills], categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <Card className="border-l-4 border-l-primary/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {categoryIcons[category] && React.createElement(categoryIcons[category], { className: "w-4 h-4" })}
                  {category}
                  <Badge variant="secondary" className="text-xs">
                    {categorySkills.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {categorySkills.slice(0, 3).map((skill, index) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {skill.level}% · {getSkillLevelLabel(skill.level)}
                      </span>
                    </div>
                    <Progress 
                      value={skill.level} 
                      className="h-2"
                      indicatorClassName={getProgressColor(skill.level)}
                    />
                  </div>
                ))}
                {categorySkills.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{categorySkills.length - 3} more skills
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Skills & Expertise</h3>
        <Badge variant="outline" className="text-xs">
          {skillsToDisplay.length} total skills
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(skillsByCategory).map(([category, categorySkills], categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                    {categoryIcons[category] && React.createElement(categoryIcons[category], { className: "w-4 h-4" })}
                  </div>
                  <div>
                    <div className="text-base font-semibold">{category}</div>
                    <div className="text-sm text-muted-foreground">
                      {categorySkills.length} skill{categorySkills.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorySkills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">{skill.name}</div>
                        {skill.description && (
                          <div className="text-sm text-muted-foreground">{skill.description}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{skill.level}%</div>
                        <Badge variant="secondary" className="text-xs">
                          {getSkillLevelLabel(skill.level)}
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={skill.level} 
                      className="h-3"
                      indicatorClassName={getProgressColor(skill.level)}
                    />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
