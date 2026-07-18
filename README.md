# DVWA Security Casebook

An original, evidence-led web application security showcase prepared by **Azizul Hakim Omor**. The project documents ten controlled-lab findings in Damn Vulnerable Web Application (DVWA), with testing context, evidence, impact analysis, and defensive recommendations.

## Live site

After GitHub Pages is enabled, the project will be available at:

`https://azizulhakim00.github.io/dvwa-security-casebook/`

## Highlights

- Ten filterable security case files
- Thirty-six optimized evidence images
- Risk overview and repeatable assessment method
- Expandable findings with test paths and remediation
- Fullscreen evidence viewer with keyboard navigation
- Responsive layouts for desktop, tablet, and mobile
- Accessible controls, reduced-motion support, and semantic structure
- No framework or build step required

## Project structure

```text
dvwa-security-casebook/
├── assets/evidence/    # Optimized controlled-lab captures
├── css/style.css       # Complete visual system and responsive rules
├── js/data.js          # Structured finding content
├── js/app.js           # Rendering, filters, gallery and interactions
├── index.html          # Main casebook page
├── robots.txt
└── .nojekyll           # GitHub Pages compatibility
```

## Run locally

Because the site is static, any local HTTP server will work:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Ethical use

Every demonstration belongs to an isolated, deliberately vulnerable training environment. The material is provided for authorized education and defensive security improvement only. Do not test systems without clear permission.

## Author

**Azizul Hakim Omor**  
CSE Undergraduate, Southeast University

- [Portfolio](https://my-portfolio-nine-opal-kxj5ttgspi.vercel.app/)
- [GitHub](https://github.com/AzizulHakim00)
- [LinkedIn](https://www.linkedin.com/in/azizul-hakim-omor-5991b3410/)
