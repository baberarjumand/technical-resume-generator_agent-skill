# tech-resume-generator_files

Workspace folder for the **tech-resume-generator** agent skill (created at your **project root**).

| Subfolder | Purpose |
| --- | --- |
| [`user_professional_data/`](user_professional_data/README.md) | Your career materials (resumes, LinkedIn, certs, notes) |
| [`job_description_data/`](job_description_data/README.md) | Target job descriptions (JD-tailored mode) |
| [`output/`](output/README.md) | Generated `professional_data.md`, `general_generated_resume.pdf` / `tailored_generated_resume.pdf` |

## Typical flow

1. Agent asks you to add career files → lists them → you confirm  
2. You choose **general** or **JD-tailored**  
3. If tailored: add JD files → agent lists them → you confirm  
4. Outputs land in `output/` with the fixed PDF names above  

Then ask your agent to run **tech-resume-generator**.
