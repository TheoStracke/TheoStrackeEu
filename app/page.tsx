"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Mail, MapPin, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FeaturedProjectCard } from "./components/featured-project-card";
import { MagneticButton } from "./components/magnetic-button";
import { Marquee } from "./components/marquee";
import { MorphingButton } from "./components/morphing-button";
import { NeuralOverlay } from "./components/neural-overlay";
import { Reveal } from "./components/reveal";
import { SectionHeading } from "./components/section-heading";
import { SideNav } from "./components/side-nav";

const experiences = [
  {
    company: "Rede Vellum",
    period: "Jul/2025 – Atual",
    role: "Analista de Suporte Técnico",
    details: "Desenvolvi automações e scripts (Python/Node.js) para operações, integrei dados via SQL/APIs e diagnostiquei bugs em produção. Otimizei confiabilidade e reduzi MTTR em 20% com métricas e melhorias de estabilidade.",
    logo: "/images/logos/vellum.png",
    skills: ["RPA e Automação", "Otimização de SLA", "Gestão de Incidentes de Ciclo Completo", "Gestão de Identidade Digital", "Diagnóstico SaaS"],
  },
  {
    company: "Thomson Reuters Brasil",
    period: "Fev/2023 – Mar/2025",
    role: "Técnico de Suporte de Relatórios",
    details: "Automação de rotinas com Python e SQL, manutenção de relatórios e pipelines. Investigação de incidentes em ambientes críticos, otimização de consultas e diagnóstico de performance/bugs com foco em estabilidade.",
    logo: "/images/logos/thomson-reuters.png",
    skills: ["Consultas SQL Avançadas", "Suporte a Sistemas Críticos", "Integridade de Dados Financeiros", "Manutenção de Sistemas Legados", "Análise de Dados"],
  },
  {
    company: "Exército Brasileiro",
    period: "Mar/2024 – Jan/2025",
    role: "",
    details: "Disciplina, organização e operações logísticas sob pressão.",
    logo: "/images/logos/exercito.png",
    skills: ["Gestão de Recursos em Crises", "Logística Estratégica", "Tomada de Decisão sob Alta Pressão", "Conformidade Operacional", "Controle de Inventário"],
  },
];

const education = [
  {
    degree: "Análise e Desenvolvimento de Sistemas",
    institution: "Senac SC",
    period: "2023 - 2026",
    type: "Graduação",
    logo: "/images/logos/senac.png",
    skills: ["Arquitetura de Software", "Pipelines de CI/CD", "Metodologias Ágeis/Scrum", "Modelagem de Banco de Dados Relacional", "Escalabilidade de Sistemas"],
  },
  {
    degree: "Programação de Jogos Digitais",
    institution: "Senac SC",
    period: "2020 - 2023",
    type: "Técnico",
    logo: "/images/logos/senac.png",
    skills: ["Engines em Tempo Real (Unity)", "Pipeline de Assets 3D", "POO em C#", "UX Imersiva", "Simulação Física"],
  },
];

const skills = ["React", "Node.js", "Python", "JavaScript", "SQL", "Automação", "Troubleshooting", "Power BI"];

interface ActiveExperience {
  type: "experience" | "education";
  company: string;
  skills: string[];
}

export default function Page() {
  const [activeModal, setActiveModal] = useState<ActiveExperience | null>(null);

  const socials = [
    {
      label: "Email",
      href: "mailto:theostracke11@gmail.com",
      icon: <Mail size={18} />
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/theostracke",
      icon: <Linkedin size={18} />
    },
    {
      label: "GitHub",
      href: "https://github.com/theostracke",
      icon: <Github size={18} />
    }
  ];

  return (
    <main className="bg-background text-ink">
      <SideNav />
      <NeuralOverlay
        skills={activeModal?.skills || []}
        title={activeModal?.company || ""}
        logo={
          activeModal?.type === "experience"
            ? experiences.find((e) => e.company === activeModal?.company)?.logo
            : education.find((e) => e.institution === activeModal?.company)?.logo
        }
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
      />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 pb-24 pt-16 md:px-12 lg:px-20">
        <header className="flex items-center justify-between text-xs uppercase tracking-wider text-neutral-500">
          <Image src="/images/logos/ts.svg" alt="TS Logo" width={40} height={40} className="h-10 w-auto" />
          <span className="flex items-center gap-2 font-mono text-[13px]">
            <MapPin size={14} /> Palhoça, SC
          </span>
        </header>

        <section id="hero" className="relative grid min-h-[70vh] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <Reveal>
              <p className="font-mono text-[12px] uppercase tracking-wider text-neutral-500">Radical Minimalismo</p>
            </Reveal>
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
                className="font-display text-5xl leading-[0.9] tracking-[-0.02em] font-bold sm:text-6xl md:text-7xl lg:text-8xl"
              >
                THEO STRACKE.
              </motion.h1>
              <Reveal>
                <p className="max-w-2xl text-lg leading-relaxed text-neutral-700 md:text-xl">
                  Desenvolvedor de Sistemas Web (React · Node.js · Python · SQL) com background sólido em operações e suporte.
                </p>
              </Reveal>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <MagneticButton href="#projects">Ver Projetos</MagneticButton>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-neutral-500"
              >
                Disponível para colaborações
                <span className="h-[1px] w-12 bg-ink" />
              </motion.span>
            </div>
          </div>

          <div id="about" className="relative flex flex-col gap-6 rounded-3xl border border-ink/10 bg-white/60 p-8 shadow-glow">
            <Reveal>
              <p className="text-sm leading-relaxed text-neutral-700">
                Tenho 20 anos e transformo problemas complexos em soluções eficientes. Com background sólido em Suporte
                Técnico e Análise de Dados, foco na estabilidade operacional e automação de rotinas. Atualmente cursando
                Análise e Desenvolvimento de Sistemas no Senac/SC.
              </p>
            </Reveal>
            <div className="flex flex-col gap-3 text-sm uppercase tracking-[0.18em] text-neutral-600">
              <span className="flex items-center gap-2">
                <div className="h-[6px] w-[6px] rounded-full bg-ink" /> Experiência + Dados + Código
              </span>
              <span className="flex items-center gap-2">
                <div className="h-[6px] w-[6px] rounded-full bg-ink" /> Suporte Nível 2 focado em automação
              </span>
            </div>
          </div>
        </section>

        <section id="about" className="space-y-10">
          <SectionHeading label="Sobre" eyebrow="Perfil" />
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            <Reveal>
              <p className="max-w-xl text-xl leading-relaxed text-neutral-700">
                Busco entregar confiabilidade e clareza. Minha abordagem é de produto: entender o problema, prototipar
                rápido, medir impacto e iterar. Desenvolvimento ágil de soluções escaláveis em React, Node.js, Python e SQL — com foco em automação, observabilidade e estabilidade. O resultado é um stack que reduz ruído e mantém operações no eixo.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-col gap-3 text-sm uppercase tracking-[0.2em] text-neutral-600">
                <span className="flex items-center gap-2">
                  <ArrowUpRight size={16} /> Suporte técnico + Engenharia leve
                </span>
                <span className="flex items-center gap-2">
                  <ArrowUpRight size={16} /> Processos escaláveis e mensuráveis
                </span>
                <span className="flex items-center gap-2">
                  <ArrowUpRight size={16} /> Automação enxuta para times enxutos
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="experience" className="space-y-10">
          <SectionHeading label="Experiência" eyebrow="Profissional" />
          <div>
            {experiences.map((exp) => (
              <Reveal key={exp.company} className="relative w-full py-12 border-b border-neutral-200">
                <div className="w-full pr-32 space-y-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">{exp.period}</p>
                  <div className="space-y-1 flex items-start justify-between">
                    <div>
                      <p className="font-display text-2xl md:text-3xl">{exp.company}</p>
                      {exp.role && <p className="text-sm uppercase tracking-[0.18em] text-neutral-600">{exp.role}</p>}
                    </div>
                    <MorphingButton
                      onClick={() => setActiveModal({ type: "experience", company: exp.company, skills: exp.skills })}
                    />
                  </div>
                  <p className="text-lg leading-relaxed text-neutral-700">{exp.details}</p>
                </div>
                <div className="hidden md:flex absolute right-0 top-12 w-24 h-24 bg-white border border-neutral-100 rounded-lg items-center justify-center">
                  <img src={exp.logo} alt={`${exp.company} logo`} className="h-full w-full object-contain" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="education" className="space-y-10">
          <SectionHeading label="Formação" eyebrow="Educação" />
          <div>
            {education.map((edu) => (
              <Reveal key={edu.degree} className="relative w-full py-12 border-b border-neutral-200">
                <div className="w-full pr-32 space-y-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">{edu.period}</p>
                  <div className="space-y-1 flex items-start justify-between">
                    <div>
                      <p className="font-display text-2xl md:text-3xl">{edu.institution}</p>
                      <p className="text-sm uppercase tracking-[0.18em] text-neutral-600">{edu.type}</p>
                    </div>
                    <MorphingButton
                      onClick={() => setActiveModal({ type: "education", company: edu.institution, skills: edu.skills })}
                    />
                  </div>
                  <p className="text-lg leading-relaxed text-neutral-700">{edu.degree}</p>
                </div>
                <div className="hidden md:flex absolute right-0 top-12 w-24 h-24 bg-white border border-neutral-100 rounded-lg items-center justify-center">
                  <img src={edu.logo} alt={`${edu.institution} logo`} className="h-full w-full object-contain" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="skills" className="space-y-6">
          <SectionHeading label="Skills" eyebrow="Stack" />
          <Marquee items={skills} />
        </section>

        <section id="projects" className="space-y-10">
          <SectionHeading label="DespaFácil" eyebrow="Projeto em Destaque" />
          <Reveal>
            <FeaturedProjectCard
              name="DespaFácil"
              description="SaaS de gestão financeira com UX enxuta e foco em produtividade. Tech stack: React, Node.js, Python, SQL."
              href="https://despa-facil.vercel.app/"
            />
          </Reveal>
        </section>

        <footer id="connect" className="space-y-8 rounded-3xl border border-ink/10 bg-white/60 p-10 shadow-card">
          <SectionHeading label="Conecte-se" eyebrow="Contato" />
          <div className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.18em] text-neutral-600">
            {socials.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.label !== "Email" ? "_blank" : undefined}
                rel={item.label !== "Email" ? "noreferrer" : undefined}
                className="group flex items-center gap-2 rounded-full border border-ink/10 px-5 py-3 transition-colors duration-300 hover:-translate-y-0.5 hover:border-ink"
              >
                <span className="text-ink/80 group-hover:text-ink">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
            <span className="flex items-center gap-2 text-xs text-neutral-500">
              <MapPin size={16} /> Palhoça, SC - Brasil
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
