const projects = [
  {
    title: "SoouDD",
    time: "2026",
    categories: ["Product", "Website"],
    desc: [
      { text: "Music record site for quick edits and mixing." },
      { link: { text: "Visit site", url: "https://sooudd-studio.milijian53.chatgpt.site/" } }
    ],
    image: "/media/SoouDD.jpg",
    tags: ["Website", "Product"],
    tools: ["CodeX"],
    type: "small",
    alt: "SoouDD cover image"
  },{
    title: "With Habit",
    time: "2026",
    categories: ["Product", "Book"],
    desc: "Habit-tracking app for building positive daily routines.",
    image: "/media/withhabit-1.jpg",
    link: "/projects/habit.html",
    type: "main",
    alt: "With Habit cover image"
  },
  {
    title: "Bad Habits",
    time: "2026",
    categories: ["Poster"],
    desc: "Typographic poster series exploring addictive behaviors.",
    image: "/media/bad-habits_Page_3.jpg",
    type: "small",
    tags: ["Poster"],
    tools: ["Illustrator", "Photoshop"],
    alt: "Bad Habits cover image"
  },
  {
    title: "MoMA PSX",
    time: "2025",
    categories: ["Branding", "Motion"],
    desc: "Brand identity and motion design for a MoMA video game exhibition.",
    image: "/media/psx-1.jpg",
    link: "/projects/psx.html",
    type: "main",
    alt: "MoMA PSX cover image"
  },
  {
    title: "Will",
    time: "2025",
    categories: ["Poster"],
    desc: "Experimental poster exploring themes of willpower.",
    image: "/media/will.jpg",
    type: "small",
    tags: ["Poster"],
    tools: ["Illustrator", "Photoshop"],
    alt: "Will cover image"
  },
  {
    title: "Listening To The Language of Birds",
    time: "2025",
    categories: ["Poster"],
    desc: "Illustrated poster for a sound and nature listening event.",
    image: "/media/listen.jpg",
    type: "small",
    tags: ["Poster"],
    tools: ["Figma", "Illustrator"],
    alt: "Listening To The Language of Birds cover image"
  },
  {
    title: "Echo",
    time: "2025",
    categories: ["App"],
    desc: "Mobile app designed for reflective journaling and self-awareness.",
    image: "/media/echo-1.jpg",
    link: "/projects/echo.html",
    type: "main",
    alt: "Echo cover image"
  },
  {
    title: "Dream Room",
    time: "2025",
    categories: ["3D"],
    desc: "3D spatial design exploring domestic ideals and interior dreaming.",
    image: "/media/desktop.jpg",
    video: "/media/desktopvd.webm",
    type: "small",
    tags: ["Digital", "3D"],
    tools: ["Blender", "Photoshop"],
    alt: "Dream Room cover image"
  },
  {
    title: "Upcyclo",
    time: "2025",
    categories: ["Branding", "Book"],
    desc: "Brand identity system for a circular economy marketplace.",
    image: "/media/upcyclo-1.jpg",
    link: "/projects/upcyclo.html",
    type: "main",
    alt: "Upcyclo cover image"
  },
  {
    title: "In A Rainy Day",
    time: "2025",
    categories: ["Illustration"],
    desc: "Illustration series capturing quiet moments in rainy weather.",
    image: "/media/rainybird.jpg",
    type: "small",
    tags: ["Illustration"],
    tools: ["Procreate", "Illustrator"],
    alt: "In A Rainy Day cover image"
  },
  {
    title: "It's Buisness",
    time: "2025",
    categories: ["Illustration"],
    desc: "Satirical illustration series on modern work culture.",
    image: "/media/buisness.jpg",
    type: "small",
    tags: ["Illustration"],
    tools: ["Procreate", "Illustrator"],
    alt: "Its Buisness cover image"
  },
  {
    title: "Music+",
    time: "2024",
    categories: ["App"],
    desc: "Music discovery app with mood-based curation and spatial audio.",
    image: "/media/music1.jpg",
    link: "/projects/music.html",
    type: "main",
    alt: "Music+ cover image"
  },
  {
    title: "NYC Cleans",
    time: "2023",
    desc: [
      { text: "A site for New York City Spring cleanup event series." },
      { link: { text: "Visit site", url: "https://loub697.interactive.rodeo/studio/03_nyc-in-data/index.html" } }
    ],
    image: "/media/clean.jpg",
    tags: ["Website"],
    type: "small",
    tools: ["API"],
    alt: "NYC Cleans cover image"
  },
  {
    title: "Inside Out",
    time: "2023",
    categories: ["Website"],
    // desc can also be an array of paragraphs: { text, link: { text, url } } (link optional) — shown in the Archive modal
    desc: [
      { text: "Interactive website built around emotional mapping and inner dialogue." },
      { link: { text: "Visit site", url: "https://loub697.interactive.rodeo/studio/02_elastic-collection/part_8/index.html" } }
    ],
    image: "/media/one.png",
    type: "small",
    tags: ["Website"],
    tools: ["Figma", "Photoshop"],
    alt: "Inside Out cover image"
  },
  {
    title: "Fabric",
    time: "2023",
    categories: ["Motion"],
    desc: "Motion piece exploring the texture and movement of woven fabric.",
    image: "/media/fabric.jpg",
    video: "/media/fabricae.webm",
    type: "small",
    tags: ["Digital", "Motion", "Film"],
    tools: ["After Effects", "Premiere Pro"],
    alt: "Fabric cover image"
  },
  {
    title: "Mirrored Universe",
    time: "2023",
    categories: ["Book", "Website"],
    desc: "Book and website exploring parallel realities and self-reflection.",
    image: "/media/universe.jpg",
    link: "/projects/universe.html",
    type: "main",
    alt: "Mirrored Universe cover image"
  },
  {
    title: "In Praise of Shadows",
    time: "2023",
    categories: ["Website"],
    desc: [
      { text: "An immersive experience around the beauty of light and shadow." },
      { link: { text: "Visit site", url: "https://loub697.interactive.rodeo/studio/01_stories_as_network/part4/index.html" } }
    ],
    image: "/media/Shadows.jpg",
    type: "small",
    tags: ["Website"],
    tools: ["Figma"],
    alt: "In Praise of Shadows cover image"
  }
];

/* Site-wide footer copy — edit placeholders here */
const site = {
  name: "Brianna Lou",
  role: "Designer",
  location: "NY, USA",
  email: "briannalou453@gmail.com",
  currentlyTitle: "Currently",
  currently: [
    ["Status", "Available"],
    ["Based in", "New York"],
    ["Focus", "Visual Identity, UX/UI Design"]
  ],
  contactTitle: "Contact",
  emailCta: "Email me",
  links: [
    { label: "Portfolio", href: "/media/BriannaLou_Portfolio.pdf" },
    { label: "Resume", href: "/media/BriannaL_Resume.pdf" },
    { label: "Instagram", href: "https://instagram.com/bri_l85", external: true },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/brianna-lou-27143441b", external: true }
  ]
};

/* About page notes board — add, edit or remove notes here (title + text) */
const notes = [
  { title: "New site SoouDD published", text: "A recording & editing tool for creating songs, vibecoding." },
  { title: "Idea x 1", text: "Design a note taking tool that can create text and drawings freely on phone." },
  { title: "Idea x 2", text: "Design a personal IP" },
  { title: "Looking for..", text: "Collaborators for a design project / a game / a fun idea." },
  { title: "Thinking", text: "A car that can fly :0 wow. How will the rules change in the future?" },
  // Optional media: { type: "image" | "video" | "audio", src, alt }. title and text are optional too.
  { title: "Imagination from the past", media: { type: "image", src: "/media/fantasy.jpg", alt: "idea illustration" }, text: "Throw a piece to build a vibrant scene in air." },
  { media: { type: "video", src: "/media/plant.webm", alt: "World underwater" } },
  { title: "Music Record with SoouDD", media: { type: "audio", src: "/media/rightbywrong_cv.wav" }, text: "Cover Right by Wrong - LilGhost" }
];
