import { ViewTransition } from "react";
import { CHAPTERS, formatIndex } from "@/lib/chapters";
import type { Locale } from "@/lib/i18n";
import { PAGE_TRANSITION } from "@/lib/transitions";
import type { ChapterId, Dictionary } from "@/types/dictionary";
import { About } from "./chapters/about";
import { Army } from "./chapters/army";
import { Connect } from "./chapters/connect";
import { Education } from "./chapters/education";
import { Hero } from "./chapters/hero";
import { Projects } from "./chapters/projects";
import { Skills } from "./chapters/skills";
import { Thomson } from "./chapters/thomson";
import { Unna } from "./chapters/unna";
import { Vellum } from "./chapters/vellum";
import { Loader } from "./loader";
import { HashScroll } from "./providers/hash-scroll";
import { Stage } from "./stage/stage";
import { Header } from "./ui/header";
import { ProgressHud } from "./ui/progress-hud";

interface HomePageProps {
  lang: Locale;
  dictionary: Dictionary;
}

const indexOf = (id: ChapterId) => formatIndex(CHAPTERS.indexOf(id));

export function HomePage({ lang, dictionary: d }: HomePageProps) {
  return (
    <>
      <Loader label={d.loader.label} />
      <Stage skills={d.skills} />
      <Header
        lang={lang}
        page="home"
        dict={{ nav: d.nav, languageSwitcher: d.languageSwitcher, location: d.hero.location, briefing: d.briefing }}
      />
      <ProgressHud labels={d.nav.chapters} />

      <ViewTransition enter={PAGE_TRANSITION.enter} exit={PAGE_TRANSITION.exit} default="none">
        <main id="main">
          <Hero dict={d.hero} />
          <About dict={d.about} index={indexOf("about")} />
          <Education dict={d.education} index={indexOf("education")} />
          <Army dict={d.army} index={indexOf("army")} />
          <Thomson dict={d.thomson} index={indexOf("thomson")} />
          <Skills dict={d.skills} index={indexOf("skills")} />
          <Vellum dict={d.vellum} index={indexOf("vellum")} lang={lang} />
          <Unna dict={d.unna} index={indexOf("unna")} />
          <Projects dict={d.projects} index={indexOf("projects")} lang={lang} />
          <Connect dict={d.contact} index={indexOf("connect")} />
        </main>
      </ViewTransition>
      <HashScroll />
    </>
  );
}
