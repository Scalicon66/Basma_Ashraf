import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Mail, BookOpen, Award, Users, Menu, X, MapPin, ArrowRight, Quote } from "lucide-react";
import emailjs from "@emailjs/browser";

import heroMath from "./assets/hero-math.png";
import aboutMath from "./assets/about-math.png";


function CountUp({ end, duration = 1500, suffix = "", startTrigger = false }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startTrigger) return;

    let start = 0;
    const endValue = parseInt(end, 10);
    if (isNaN(endValue)) return;

    const incrementTime = Math.max(Math.floor(duration / endValue), 10);
    
    const timer = setInterval(() => {
      start += 1;
      if (start >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [end, duration, startTrigger]);

  return <>{count}{suffix}</>;
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [clickRipples, setClickRipples] = useState([]);
  const [activeCardId, setActiveCardId] = useState(null);
  
  const formRef = useRef();
  const [isSending, setIsSending] = useState(false);
  const [sentStatus, setSentStatus] = useState(null);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSending(true);
    setSentStatus(null);

    const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "your_service_id";
    const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "your_template_id";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "your_public_key";

    if (serviceID === "your_service_id" || templateID === "your_template_id" || publicKey === "your_public_key") {
      console.warn("EmailJS is not configured. Please fill in credentials in your .env file.");
      setTimeout(() => {
        setIsSending(false);
        setSentStatus("success");
        formRef.current.reset();
      }, 1000);
      return;
    }

    emailjs.sendForm(serviceID, templateID, formRef.current, {
      publicKey: publicKey,
    })
      .then(
        () => {
          setIsSending(false);
          setSentStatus("success");
          formRef.current.reset();
        },
        (error) => {
          console.error("EmailJS error:", error);
          setIsSending(false);
          setSentStatus("error");
        }
      );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      const unmountTimer = setTimeout(() => {
        setShouldRender(false);
      }, 700);
      return () => clearTimeout(unmountTimer);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            entry.target.setAttribute("data-revealed", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [loading]);

  // Restore the "active" class to already-revealed elements after any React re-render,
  // preventing layout/opacity resets during state updates (e.g. click/taps)
  useLayoutEffect(() => {
    const revealedElements = document.querySelectorAll("[data-revealed='true']");
    revealedElements.forEach((el) => {
      if (!el.classList.contains("active")) {
        el.classList.add("active");
      }
    });
  });

  const createRipple = (x, y) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setClickRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setClickRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  useEffect(() => {
    const handleClick = (e) => {
      createRipple(e.clientX, e.clientY);
      setActiveCardId(null);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleCardClick = (e, cardId) => {
    e.stopPropagation();
    createRipple(e.clientX, e.clientY);
    setActiveCardId((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {clickRipples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-accent/80 animate-click-circle"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
          />
        ))}
      </div>
      {shouldRender && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-all duration-700 ease-in-out ${
            loading ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="relative flex items-center justify-center">
            {/* Elegant spinning mathematical progress ring */}
            <div className="h-24 w-24 rounded-full border border-accent/10 border-t-accent animate-spin" />
            <div className="absolute text-2xl font-serif text-foreground font-light tracking-widest animate-pulse">
              B.A.
            </div>
          </div>
          <div className="mt-6 text-[10px] font-sans font-medium tracking-[0.25em] text-muted-foreground uppercase animate-pulse">
            Mathematics
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-background transition-opacity duration-1000 ${loading ? "opacity-0" : "opacity-100"}`}>
      {/* Navigation */}
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="heading-md text-2xl font-normal tracking-tight text-foreground">
            B.A.
          </a>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">About</a>
            <a href="#philosophy" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Philosophy</a>
            <a href="#courses" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Courses</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Testimonials</a>
            <a href="#contact" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Get in Touch
            </a>
          </div>
          <button
            className="md:hidden text-foreground cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Slide-down mobile menu */}
        <div
          className={`mobile-menu md:hidden border-border bg-background overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 border-t opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col px-6 py-5 gap-1">
            {[
              { href: "#about", label: "About" },
              { href: "#philosophy", label: "Philosophy" },
              { href: "#courses", label: "Courses" },
              { href: "#testimonials", label: "Testimonials" },
            ].map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-border/50 last:border-0"
                style={{ transitionDelay: mobileMenuOpen ? `${i * 40}ms` : "0ms" }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={`section-padding${!loading ? " hero-ready" : ""}`}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            {/* Image — order-1 on mobile so it animates FIRST (top) */}
            <div className="order-1 lg:order-2">
              <div className="relative hero-img">
                <img
                  src={heroMath}
                  alt="Abstract mathematical geometry art"
                  width={960}
                  height={540}
                  className="rounded-2xl object-cover shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-5 shadow-xl md:block border border-border">
                  <p className="heading-md text-lg text-foreground">B.Sc. Mathematics</p>
                  <p className="body-sm mt-1">Benha University, Egypt</p>
                </div>
              </div>
            </div>

            {/* Text — order-2 on mobile so it appears BELOW the image */}
            <div className="order-2 lg:order-1">
              <span className="hero-overline label-overline text-accent mb-6 block">Mathematics Educator</span>
              <h1 className="hero-title heading-xl mb-6 text-foreground">
                Basma <em className="text-accent font-serif">Ashraf</em>
              </h1>
              <p className="hero-body body-lg mb-8 max-w-lg">
                Passionate mathematics teacher helping students across Egyptian, Saudi, British, and Emirati curricula build confidence — through patience, clarity, and real understanding.
              </p>
              <div className="hero-buttons flex flex-wrap gap-4">
                <a href="#courses" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg">
                  Explore Courses
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#about" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-accent/5">
                  About Me
                </a>
              </div>
              <div className="hero-stats mt-10 flex gap-8">
                <div>
                  <p className="heading-md text-3xl text-accent">
                    <CountUp end="4" suffix="+" startTrigger={!loading} />
                  </p>
                  <p className="body-sm mt-1">Years Teaching</p>
                </div>
                <div>
                  <p className="heading-md text-3xl text-accent">
                    <CountUp end="4" suffix="" startTrigger={!loading} />
                  </p>
                  <p className="body-sm mt-1">Curricula Taught</p>
                </div>
                <div>
                  <p className="heading-md text-3xl text-accent">
                    <CountUp end="100" suffix="%" startTrigger={!loading} />
                  </p>
                  <p className="body-sm mt-1">Online & Personalized</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* About */}
      <section id="about" className="section-padding border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="relative reveal reveal-rotate-left">
              <img
                src={aboutMath}
                alt="Elegant mathematical proofs being written"
                width={512}
                height={640}
                loading="lazy"
                className="rounded-2xl object-cover shadow-xl"
              />
              <div className="absolute -right-4 top-8 hidden rounded-lg bg-accent px-4 py-3 text-sm font-medium text-accent-foreground shadow-lg lg:block">
                "Every student can love math — they just need the right teacher to show them how."
              </div>
            </div>
            <div className="reveal reveal-right reveal-delay-200">
              <span className="label-overline text-accent mb-4 block">About</span>
              <h2 className="heading-lg mb-6 text-foreground">
                Turning complexity into <em className="text-accent font-serif">clarity</em>
              </h2>
              <div className="space-y-4 body-lg">
                <p>
                  I'm a mathematics graduate from Benha University with hands-on experience teaching students online across a wide range of curricula — Egyptian, Saudi, British (Oxford & Cambridge), and Emirati. My classrooms are warm, patient spaces where questions are welcomed and mistakes are part of learning.
                </p>
                <p>
                  Since 2022 I have worked as a freelance online instructor, customizing lessons to each student's level and learning style, communicating closely with parents, and tracking progress lesson by lesson. I also hold a Professional Training Certificate from ICB International School.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground border border-border">Egyptian Curriculum</span>
                <span className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground border border-border">Saudi Curriculum</span>
                <span className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground border border-border">Oxford & Cambridge</span>
                <span className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground border border-border">Emirati Curriculum</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section id="philosophy" className="section-padding bg-cream border-t border-b border-border">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center reveal reveal-fade">
            <span className="label-overline text-accent mb-4 block">Teaching Philosophy</span>
            <h2 className="heading-lg mx-auto max-w-2xl text-foreground">
              Three principles that guide every lesson
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div
              className={`rounded-2xl border bg-card p-8 transition-all hover:shadow-lg reveal reveal-zoom cursor-pointer ${
                activeCardId === "philosophy-0" ? "border-accent/40 shadow-lg" : "border-border"
              }`}
              onClick={(e) => handleCardClick(e, "philosophy-0")}
            >
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-accent/10">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <h3 className="heading-md mb-3 text-xl text-foreground">Meet Each Student</h3>
              <p className="body-sm">
                Every student learns differently. I adapt materials and pace to each learner's curriculum, language, and confidence level — so the lesson fits the student, not the other way around.
              </p>
            </div>
            <div
              className={`rounded-2xl border bg-card p-8 transition-all hover:shadow-lg reveal reveal-zoom reveal-delay-100 cursor-pointer ${
                activeCardId === "philosophy-1" ? "border-accent/40 shadow-lg" : "border-border"
              }`}
              onClick={(e) => handleCardClick(e, "philosophy-1")}
            >
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="heading-md mb-3 text-xl text-foreground">Partner with Parents</h3>
              <p className="body-sm">
                Progress happens when home and classroom align. I keep open, honest communication with parents — sharing feedback, goals, and clear next steps after every session.
              </p>
            </div>
            <div
              className={`rounded-2xl border bg-card p-8 transition-all hover:shadow-lg reveal reveal-zoom reveal-delay-200 cursor-pointer ${
                activeCardId === "philosophy-2" ? "border-accent/40 shadow-lg" : "border-border"
              }`}
              onClick={(e) => handleCardClick(e, "philosophy-2")}
            >
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-accent/10">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <h3 className="heading-md mb-3 text-xl text-foreground">Patience First</h3>
              <p className="body-sm">
                Math anxiety is real. With empathy and patience, I help students slow down, ask questions freely, and rebuild their relationship with mathematics from the ground up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="section-padding">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end reveal reveal-fade">
            <div>
              <span className="label-overline text-accent mb-4 block">Curricula</span>
              <h2 className="heading-lg text-foreground">Curricula I Teach</h2>
            </div>
            <p className="body-sm max-w-sm">
              Online math tutoring tailored to each international system.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Egyptian Curriculum",
                level: "Primary – Secondary",
                description: "Full support for the Egyptian national math syllabus, including thanaweya amma preparation, revisions, and exam techniques.",
                students: "Arabic & English",
              },
              {
                title: "Saudi Curriculum",
                level: "Primary – Secondary",
                description: "Aligned with the Saudi Ministry of Education math program — concepts, problem solving, and Qudurat-style practice.",
                students: "Arabic medium",
              },
              {
                title: "British – Oxford",
                level: "Primary – IGCSE",
                description: "Oxford International Maths series, with structured lessons, worksheets, and end-of-unit assessments in English.",
                students: "English medium",
              },
              {
                title: "British – Cambridge",
                level: "Primary – IGCSE",
                description: "Cambridge Lower Secondary & IGCSE Mathematics (0580), including past paper practice and exam strategy.",
                students: "English medium",
              },
              {
                title: "Emirati Curriculum",
                level: "Primary – Secondary",
                description: "UAE Ministry of Education math syllabus — concept building, homework support, and end-of-term revision.",
                students: "Arabic & English",
              },
              {
                title: "Private 1:1 Tutoring",
                level: "All Levels",
                description: "Personalized online sessions on Zoom or Google Meet, with custom worksheets, weekly goals, and parent updates.",
                students: "Flexible scheduling",
              },
            ].map((course, index) => {
              const isActive = activeCardId === `course-${index}`;
              return (
                <div
                  key={course.title}
                  onClick={(e) => handleCardClick(e, `course-${index}`)}
                  className={`group rounded-2xl border bg-card p-6 transition-all hover:border-accent/30 hover:shadow-lg reveal reveal-zoom cursor-pointer reveal-delay-${(index % 3) * 100} ${
                    isActive ? "border-accent/40 shadow-lg" : "border-border"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground border border-border">
                      {course.level}
                    </span>
                    <span className="text-xs text-muted-foreground">{course.students}</span>
                  </div>
                  <h3 className={`heading-md mb-2 text-lg text-foreground group-hover:text-accent transition-colors ${
                    isActive ? "text-accent" : ""
                  }`}>
                    {course.title}
                  </h3>
                  <p className="body-sm">{course.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section-padding bg-cream border-t border-b border-border">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center reveal reveal-fade">
            <span className="label-overline text-accent mb-4 block">Testimonials</span>
            <h2 className="heading-lg mx-auto max-w-2xl text-foreground">
              Words from students & parents
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: "Ms. Basma always explains lessons in a simple and engaging way. Her patience and encouragement helped me become more confident in using English.",
                author: "Student",
                name: "Hamza"
              },
              {
                quote: "Ms. Basma is kind, supportive, and always encourages her students to believe in themselves. Her lessons are well organized and easy to understand.",
                author: "Student",
                name: "Rodyna"
              },
              {
                quote: "Learning with Ms. Basma made studying enjoyable. She always motivates her students to do their best and never hesitates to provide extra support.",
                author: "Student",
                name: "Mansour"
              },
              {
                quote: "Ms. Basma creates a positive classroom environment where everyone feels comfortable asking questions. Her teaching helped me improve both my language skills and my confidence.",
                author: "Student",
                name: "Mohamed"
              },
              {
                quote: "I enjoyed every lesson with Ms. Basma because she uses creative methods that make learning easy and interesting. She truly cares about her students' success.",
                author: "Student",
                name: "Kenzy"
              },
              {
                quote: "Thanks to Ms. Basma's guidance and dedication, I developed stronger English skills and a greater interest in learning. She is an inspiring teacher.",
                author: "Student",
                name: "Moaz"
              },
            ].map((t, index) => {
              const isActive = activeCardId === `testimonial-${index}`;
              return (
                <div
                  key={index}
                  onClick={(e) => handleCardClick(e, `testimonial-${index}`)}
                  className={`rounded-2xl border bg-card p-8 hover:shadow-lg transition-all reveal reveal-zoom cursor-pointer reveal-delay-${(index % 3) * 100} ${
                    isActive ? "border-accent/40 shadow-lg" : "border-border"
                  }`}
                >
                  <Quote className="mb-4 h-6 w-6 text-accent/40" />
                  <p className="mb-6 text-base leading-relaxed text-foreground italic">
                    "{t.quote}"
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.author}</p>
                    <p className="body-sm">{t.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section-padding">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-primary p-8 md:p-16 border border-border">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="reveal reveal-left">
                <span className="label-overline text-primary-foreground/60 mb-4 block">Contact</span>
                <h2 className="heading-lg mb-6 text-primary-foreground">
                  Let's talk <em className="text-accent font-serif">mathematics</em>
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80">
                  Whether you're a student looking for support or a parent searching for the right tutor for your child — reach out and let's plan the first lesson together.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-primary-foreground/80">
                    <Mail className="h-5 w-5 shrink-0" />
                    <a href="mailto:basma.ashraf174@gmail.com" className="text-sm hover:text-accent transition-colors">
                      basma.ashraf174@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-primary-foreground/80">
                    <MapPin className="h-5 w-5 shrink-0" />
                    <a href="https://wa.me/201092397666" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-accent transition-colors">
                      +20 109 239 7666 · Online worldwide
                    </a>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-primary-foreground/5 p-8 backdrop-blur-sm reveal reveal-right reveal-delay-200">
                <form ref={formRef} className="space-y-4" onSubmit={sendEmail}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-primary-foreground/80">Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:border-accent focus:outline-none"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-primary-foreground/80">Email</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:border-accent focus:outline-none"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary-foreground/80">Message</label>
                    <textarea
                      rows={4}
                      name="message"
                      required
                      className="w-full resize-none rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:border-accent focus:outline-none"
                      placeholder="What would you like to discuss?"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <button
                      type="submit"
                      disabled={isSending}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/90 sm:w-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? "Sending..." : "Send Message"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    
                    {sentStatus === "success" && (
                      <span className="text-sm font-medium text-emerald-400">
                        Message sent successfully!
                      </span>
                    )}
                    {sentStatus === "error" && (
                      <span className="text-sm font-medium text-rose-400">
                        Failed to send message. Please try again.
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Basma Ashraf Hamdy. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="mailto:basma.ashraf174@gmail.com" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Email</a>
            <a href="https://wa.me/201092397666" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  </>
  );
}
