"use client";

import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Registro único dos plugins — sempre importar gsap daqui (@/lib/gsap)
gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin, useGSAP);

// Linguagem de movimento do site: saídas suaves (expo/quart out)
gsap.defaults({ ease: "expo.out", duration: 1.1 });

// Evita recalcular triggers quando a barra de endereço do mobile esconde/aparece
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText, useGSAP };
