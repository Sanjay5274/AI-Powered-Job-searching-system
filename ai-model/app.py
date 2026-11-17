import sys
import os

# Ensure local venv packages (e.g. PyPDF2) are discoverable
venv_site = os.path.join(os.path.dirname(__file__), "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(len(sys.path), venv_site)

from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import json

app = Flask(__name__)
CORS(app)


# =====================================================
# SKILL DATABASE
# =====================================================

SKILLS = [
    "python", "java", "c", "c++",
    "javascript", "typescript", "php",
    "html", "css", "react", "node.js",
    "express", "bootstrap", "tailwind css",
    "wordpress", "sql", "mysql", "mongodb",
    "machine learning", "deep learning",
    "artificial intelligence", "data science",
    "pandas", "numpy", "scikit-learn",
    "git", "github", "docker"
]


# =====================================================
# JOB DATABASE
# =====================================================

JOBS = [
    {
        "title": "Python Developer",
        "skills": ["python", "sql", "git"],
        "description": "Python programming, SQL database and Git"
    },
    {
        "title": "Machine Learning Engineer",
        "skills": [
            "python", "machine learning",
            "pandas", "numpy", "scikit-learn"
        ],
        "description": "Machine Learning and data processing"
    },
    {
        "title": "AI Engineer",
        "skills": [
            "python", "artificial intelligence",
            "machine learning", "deep learning", "numpy"
        ],
        "description": "Artificial Intelligence and Deep Learning"
    },
    {
        "title": "Data Analyst",
        "skills": [
            "python", "sql", "pandas",
            "numpy", "data science"
        ],
        "description": "Data analysis and database management"
    },
    {
        "title": "Frontend Developer",
        "skills": [
            "html", "css", "javascript",
            "react", "bootstrap"
        ],
        "description": "Frontend web development"
    },
    {
        "title": "Backend Developer",
        "skills": [
            "python", "node.js", "express",
            "sql", "mongodb"
        ],
        "description": "Backend development and databases"
    },
    {
        "title": "Full Stack Developer",
        "skills": [
            "html", "css", "javascript",
            "react", "node.js", "express",
            "mongodb", "sql"
        ],
        "description": "Frontend and backend development"
    }
]


# =====================================================
# SKILL DETECTION FUNCTION
# =====================================================

def detect_skills(resume_text):

    detected = []

    for skill in SKILLS:

        pattern = (
            r"(?<![a-z0-9])"
            + re.escape(skill)
            + r"(?![a-z0-9])"
        )

        if re.search(pattern, resume_text):
            detected.append(skill)

    return detected


# =====================================================
# HOME ROUTE
# =====================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "AI Resume Screening Service is running"
    })


# =====================================================
# RESUME ANALYSIS
# =====================================================

@app.route("/analyze", methods=["POST"])
def analyze_resume():

    if "resume" not in request.files:

        return jsonify({
            "error": "Resume PDF is required"
        }), 400

    file = request.files["resume"]

    if file.filename == "":

        return jsonify({
            "error": "Please select a resume PDF"
        }), 400

    if not file.filename.lower().endswith(".pdf"):

        return jsonify({
            "error": "Only PDF files are allowed"
        }), 400

    try:

        reader = PdfReader(file)

        resume_text = ""

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                resume_text += page_text + " "

        if not resume_text.strip():

            return jsonify({
                "error": "No readable text found in PDF."
            }), 400

    except Exception as error:

        return jsonify({
            "error": "Unable to read PDF",
            "details": str(error)
        }), 400

    resume_text = resume_text.lower()

    # DETECTED SKILLS

    detected_skills = detect_skills(resume_text)

    detected_set = set(detected_skills)

    # EDUCATION ANALYSIS

    education_keywords = [
        "degree", "b.sc", "bca", "mca",
        "m.sc", "bachelor", "master",
        "education", "university", "college"
    ]

    education_count = sum(
        1 for word in education_keywords
        if word in resume_text
    )

    education_score = min(education_count * 5, 15)

    # PROJECT ANALYSIS

    project_keywords = [
        "project", "projects", "developed",
        "application", "implemented"
    ]

    project_count = sum(
        1 for word in project_keywords
        if word in resume_text
    )

    project_score = min(project_count * 4, 20)

    # INTERNSHIP ANALYSIS

    internship_keywords = [
        "internship", "intern", "training",
        "experience", "worked"
    ]

    internship_count = sum(
        1 for word in internship_keywords
        if word in resume_text
    )

    internship_score = min(internship_count * 5, 15)

    # CERTIFICATION ANALYSIS

    certification_keywords = [
        "certification", "certificate",
        "certificates", "course",
        "seminar", "workshop"
    ]

    certification_count = sum(
        1 for word in certification_keywords
        if word in resume_text
    )

    certification_score = min(certification_count * 4, 10)

    # TECHNICAL SKILL SCORE

    skill_score = min(
        round((len(detected_skills) / len(SKILLS)) * 30),
        30
    )

    # RESUME COMPLETENESS

    sections = [
        "email", "phone", "skills",
        "education", "project",
        "experience", "internship",
        "certification"
    ]

    section_count = sum(
        1 for section in sections
        if section in resume_text
    )

    completeness_score = min(
        round((section_count / len(sections)) * 10),
        10
    )

    # FINAL RESUME SCORE

    score = (
        skill_score
        + education_score
        + project_score
        + internship_score
        + certification_score
        + completeness_score
    )

    score = min(score, 100)

    # SCORE BREAKDOWN

    score_breakdown = {

        "Technical Skills": {
            "score": skill_score,
            "max_score": 30
        },

        "Education": {
            "score": education_score,
            "max_score": 15
        },

        "Projects": {
            "score": project_score,
            "max_score": 20
        },

        "Internship / Experience": {
            "score": internship_score,
            "max_score": 15
        },

        "Certifications": {
            "score": certification_score,
            "max_score": 10
        },

        "Resume Completeness": {
            "score": completeness_score,
            "max_score": 10
        }
    }

    # TF-IDF JOB RECOMMENDATION

    job_recommendations = []

    if detected_skills:

        resume_skills_text = " ".join(detected_skills)

        job_texts = [
            " ".join(job["skills"]) + " " + job["description"]
            for job in JOBS
        ]

        documents = [resume_skills_text] + job_texts

        vectorizer = TfidfVectorizer()

        tfidf_matrix = vectorizer.fit_transform(documents)

        similarity_scores = cosine_similarity(
            tfidf_matrix[0:1],
            tfidf_matrix[1:]
        )[0]

        for job, similarity in zip(
            JOBS, similarity_scores
        ):

            match_percentage = round(
                float(similarity) * 100, 2
            )

            if match_percentage >= 10:

                job_recommendations.append({

                    "job_title": job["title"],

                    "title": job["title"],

                    "match_percentage": match_percentage,

                    "matched_skills": [
                        skill for skill in job["skills"]
                        if skill in detected_set
                    ]

                })

        job_recommendations.sort(
            key=lambda x: x["match_percentage"],
            reverse=True
        )

    # MISSING SKILLS

    relevant_skills = set()

    for recommendation in job_recommendations[:3]:

        for job in JOBS:

            if job["title"] == recommendation["job_title"]:

                relevant_skills.update(job["skills"])

    missing_skills = sorted(
        skill for skill in relevant_skills
        if skill not in detected_set
    )

    # AI IMPROVEMENT SUGGESTIONS

    suggestions = []

    if missing_skills:

        suggestions.append(
            "Consider learning these relevant skills: "
            + ", ".join(missing_skills[:8])
        )

    if project_count == 0:

        suggestions.append(
            "Add academic or practical projects with "
            "their technologies and descriptions."
        )

    if education_count == 0:

        suggestions.append(
            "Add your educational qualifications and "
            "college details."
        )

    if internship_count == 0:

        suggestions.append(
            "Include internship or training experience "
            "if available."
        )

    if certification_count == 0:

        suggestions.append(
            "Add relevant certifications, courses or "
            "seminar participation if available."
        )

    if "email" not in resume_text:

        suggestions.append(
            "Include a professional email address "
            "in your contact details."
        )

    if "phone" not in resume_text and not re.search(
        r"\b\d{10}\b", resume_text
    ):

        suggestions.append(
            "Include your contact phone number."
        )

    if not suggestions:

        suggestions.append(
            "Your resume contains the checked sections. "
            "Continue improving your project descriptions "
            "and technical achievements."
        )

    # ANALYSIS SUMMARY

    analysis = (
        "Resume analysis completed successfully. "
        "Your resume contains "
        + str(len(detected_skills))
        + " detected technical skills and "
        + str(len(job_recommendations))
        + " relevant job recommendations."
    )

    # FINAL JSON RESPONSE

    return jsonify({

        "score": score,

        "resumeScore": score,

        "score_breakdown": score_breakdown,

        "detected_skills": detected_skills,

        "detectedSkills": detected_skills,

        "missing_skills": missing_skills,

        "missingSkills": missing_skills,

        "suggestions": suggestions,

        "job_recommendations": job_recommendations,

        "jobRecommendations": job_recommendations,

        "analysis": analysis

    })


# =====================================================
# COMPANY JOB REQUIREMENT MATCHING
# =====================================================

@app.route("/match-job", methods=["POST"])
def match_job():

    job_title = request.form.get("job_title", "").strip()
    required_skills_input = request.form.get("required_skills", "")

    if not job_title:
        return jsonify({"error": "Job title is required"}), 400

    try:
        required_skills = json.loads(required_skills_input)

        if not isinstance(required_skills, list):
            return jsonify({"error": "Required skills must be a list"}), 400

    except (ValueError, TypeError):
        required_skills = required_skills_input.split(",")

    required_skills = list(dict.fromkeys(
        str(skill).strip().lower()
        for skill in required_skills
        if str(skill).strip()
    ))

    # Support uploaded job description file or text
    if "job_description" in request.files:
        jd_file = request.files["job_description"]
        if jd_file.filename != "":
            try:
                if jd_file.filename.lower().endswith(".pdf"):
                    jd_reader = PdfReader(jd_file)
                    jd_text = ""
                    for page in jd_reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            jd_text += page_text + " "
                else:
                    jd_text = jd_file.read().decode("utf-8", errors="ignore")

                jd_skills = detect_skills(jd_text.lower())
                required_skills.extend(jd_skills)
            except Exception as error:
                pass
    elif request.form.get("job_description"):
        jd_text = request.form.get("job_description")
        jd_skills = detect_skills(jd_text.lower())
        required_skills.extend(jd_skills)

    required_skills = list(dict.fromkeys(
        str(skill).strip().lower()
        for skill in required_skills
        if str(skill).strip()
    ))

    if not required_skills:
        return jsonify({"error": "Enter at least one required skill or upload a valid job description"}), 400

    resume_text = ""

    if "resume" in request.files:

        file = request.files["resume"]

        if not file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Only PDF files are allowed"}), 400

        try:
            reader = PdfReader(file)

            for page in reader.pages:
                page_text = page.extract_text()

                if page_text:
                    resume_text += page_text + " "

        except Exception as error:
            return jsonify({
                "error": "Unable to read resume PDF",
                "details": str(error)
            }), 400

    elif request.form.get("resume_skills"):

        try:
            saved_skills = json.loads(
                request.form.get("resume_skills")
            )

            if not isinstance(saved_skills, list):
                return jsonify({"error": "Invalid resume skills"}), 400

            resume_text = " ".join(str(skill) for skill in saved_skills)

        except (ValueError, TypeError):
            return jsonify({"error": "Invalid resume skills format"}), 400

    else:
        return jsonify({
            "error": "Upload a resume or select an existing resume"
        }), 400

    if not resume_text.strip():
        return jsonify({"error": "No readable resume content found"}), 400

    resume_text = resume_text.lower()

    matched_skills = []
    missing_skills = []

    for skill in required_skills:

        pattern = (
            r"(?<![a-z0-9])"
            + re.escape(skill)
            + r"(?![a-z0-9])"
        )

        if re.search(pattern, resume_text):
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    match_percentage = round(
        (len(matched_skills) / len(required_skills)) * 100,
        2
    )

    return jsonify({

        "job_title": job_title,

        "match_percentage": match_percentage,

        "matched_skills": matched_skills,

        "missing_skills": missing_skills,

        "total_required_skills": len(required_skills),

        "total_matched_skills": len(matched_skills),

        "message": "Job requirement matching completed successfully"

    }), 200


# =====================================================
# AI SKILL GAP ANALYSIS
# =====================================================

@app.route("/skill-gap", methods=["POST"])
def skill_gap_analysis():

    job_title = request.form.get("job_title", "").strip()
    resume_skills_input = request.form.get("resume_skills", "")

    if not job_title:
        return jsonify({
            "error": "Please enter a target job role."
        }), 400

    if not resume_skills_input:
        return jsonify({
            "error": "Resume skills are required."
        }), 400

    selected_job = next(
        (
            job for job in JOBS
            if job["title"].lower() == job_title.lower()
        ),
        None
    )

    if not selected_job:
        return jsonify({
            "error": "Job role not found. Please select a supported job role.",
            "available_roles": [job["title"] for job in JOBS]
        }), 404

    try:
        resume_skills = json.loads(resume_skills_input)

        if not isinstance(resume_skills, list):
            return jsonify({
                "error": "Invalid resume skills format."
            }), 400

    except (ValueError, TypeError):
        return jsonify({
            "error": "Unable to read resume skills."
        }), 400

    resume_skills = list(dict.fromkeys(
        str(skill).strip().lower()
        for skill in resume_skills
        if str(skill).strip()
    ))

    required_skills = selected_job["skills"]

    matched_skills = [
        skill for skill in required_skills
        if skill.lower() in resume_skills
    ]

    missing_skills = [
        skill for skill in required_skills
        if skill.lower() not in resume_skills
    ]

    match_percentage = round(
        (len(matched_skills) / len(required_skills)) * 100,
        2
    ) if required_skills else 0

    suggestions = [
        "Learn " + skill + " to improve your job readiness."
        for skill in missing_skills
    ]

    return jsonify({

        "message": "Skill Gap Analysis completed successfully!",

        "job_title": selected_job["title"],

        "match_percentage": match_percentage,

        "total_required_skills": len(required_skills),

        "total_matched_skills": len(matched_skills),

        "matched_skills": matched_skills,

        "missing_skills": missing_skills,

        "suggestions": suggestions

    }), 200


# =====================================================
# ADVANCED ATS RESUME CHECKER API
# =====================================================

@app.route("/ats-check", methods=["POST"])
def ats_check():

    try:

        # ---------------------------------
        # PDF VALIDATION
        # ---------------------------------

        if "resume" not in request.files:
            return jsonify({
                "message": "Please upload a PDF resume."
            }), 400

        file = request.files["resume"]

        if not file.filename.lower().endswith(".pdf"):
            return jsonify({
                "message": "Only PDF files are allowed."
            }), 400

        job_description = request.form.get(
            "job_description", ""
        ).strip()

        job_title = request.form.get(
            "job_title", ""
        ).strip()

        if not job_description:
            return jsonify({
                "message": "Please enter the Job Description."
            }), 400

        # ---------------------------------
        # PDF TEXT EXTRACTION
        # ---------------------------------

        pdf = PdfReader(file)

        resume_text = ""

        for page in pdf.pages:
            resume_text += (page.extract_text() or "") + "\n"

        if not resume_text.strip():
            return jsonify({
                "message": "Unable to extract text from this PDF."
            }), 400

        text = resume_text.lower()
        jd_text = job_description.lower()

        # ---------------------------------
        # BASIC ATS CHECKS
        # ---------------------------------

        checks = {

            "Email Address": bool(
                re.search(
                    r'[\w.+-]+@[\w-]+\.[\w.-]+', text
                )
            ),

            "Phone Number": bool(
                re.search(
                    r'\b\d{10}\b', text
                )
            ),

            "Education Section": bool(
                re.search(
                    r'\b(education|academic|qualification)\b',
                    text
                )
            ),

            "Skills Section": bool(
                re.search(
                    r'\b(skills|technologies|technical skills)\b',
                    text
                )
            ),

            "Experience Section": bool(
                re.search(
                    r'\b(experience|internship|employment)\b',
                    text
                )
            ),

            "Projects Section": bool(
                re.search(
                    r'\bprojects?\b', text
                )
            ),

            "Certifications Section": bool(
                re.search(
                    r'\b(certifications?|certificates?)\b',
                    text
                )
            )
        }

        total_checks = len(checks)
        passed_checks = sum(checks.values())

        ats_score = round(
            (passed_checks / total_checks) * 100
        )
        # ---------------------------------
        # PROFESSIONAL KEYWORD DATABASE
        # ---------------------------------

        PROFESSIONAL_KEYWORDS = {

            "technical_skills": [
                "python", "java", "javascript",
                "typescript", "c", "c++", "php",
                "html", "html5", "css", "css3",
                "react", "node.js", "express",
                "bootstrap", "tailwind css",
                "wordpress", "sql", "mysql",
                "mongodb", "postgresql",
                "machine learning", "deep learning",
                "artificial intelligence",
                "data science", "data analysis",
                "pandas", "numpy", "scikit-learn",
                "git", "github", "docker",
                "flask", "django", "fastapi",
                "rest api", "api integration",
                "firebase", "aws", "azure"
            ],

            "qualifications": [
                "bachelor", "master", "degree",
                "diploma", "computer science",
                "information technology",
                "computer applications",
                "bca", "mca", "b.sc", "m.sc",
                "engineering", "undergraduate",
                "postgraduate"
            ],

            "responsibilities": [
                "frontend development",
                "backend development",
                "full stack development",
                "web development",
                "software development",
                "application development",
                "database management",
                "database design",
                "database optimization",
                "api development",
                "api integration",
                "debugging",
                "software testing",
                "unit testing",
                "integration testing",
                "performance optimization",
                "code optimization",
                "application maintenance",
                "software maintenance",
                "deployment",
                "troubleshooting",
                "system integration",
                "responsive design",
                "reusable components",
                "clean code",
                "data processing",
                "data management",
                "develop applications",
                "maintain applications",
                "develop web applications"
            ]
        }

        # ---------------------------------
        # KEYWORD ALIASES
        # ---------------------------------

        ALIASES = {
            "javascript": ["javascript", "js"],
            "typescript": ["typescript", "ts"],
            "html": ["html", "html5"],
            "css": ["css", "css3"],
            "react": ["react", "react.js"],
            "node.js": ["node.js", "nodejs"],
            "rest api": [
                "rest api", "restful api", "rest apis"
            ],
            "scikit-learn": [
                "scikit-learn", "sklearn"
            ],
            "machine learning": [
                "machine learning", "ml"
            ],
            "artificial intelligence": [
                "artificial intelligence", "ai"
            ],
            "bachelor": [
                "bachelor", "bachelor's"
            ],
            "master": [
                "master", "master's"
            ]
        }

        # ---------------------------------
        # KEYWORD DETECTION
        # ---------------------------------

        def contains_keyword(content, keyword):

            content = content.lower()
            variants = ALIASES.get(
                keyword, [keyword]
            )

            for variant in variants:

                pattern = (
                    r"(?<![a-z0-9])"
                    + re.escape(variant)
                    + r"(?![a-z0-9])"
                )

                if re.search(pattern, content):
                    return True

            return False

        # ---------------------------------
        # EXTRACT JOB DESCRIPTION KEYWORDS
        # ---------------------------------

        def extract_keywords(content, category):

            found = []

            database = PROFESSIONAL_KEYWORDS[category]

            for keyword in database:

                if contains_keyword(content, keyword):
                    found.append(keyword)

            return found

        jd_technical_keywords = extract_keywords(
            jd_text, "technical_skills"
        )

        jd_qualification_keywords = extract_keywords(
            jd_text, "qualifications"
        )

        jd_responsibility_keywords = extract_keywords(
            jd_text, "responsibilities"
        )

        # ---------------------------------
        # MATCHED AND MISSING KEYWORDS
        # ---------------------------------

        matched_keywords = [
            keyword
            for keyword in jd_technical_keywords
            if contains_keyword(text, keyword)
        ]

        missing_keywords = [
            keyword
            for keyword in jd_technical_keywords
            if not contains_keyword(text, keyword)
        ]

        # ---------------------------------
        # MATCH SCORE FUNCTION
        # ---------------------------------

        def calculate_match(total, matched):

            if not total:
                return 0

            return round(
                (len(matched) / len(total)) * 100
            )

        keyword_score = calculate_match(
            jd_technical_keywords,
            matched_keywords
        )

        # ---------------------------------
        # QUALIFICATION MATCH
        # ---------------------------------

        qualification_matched = [
            keyword
            for keyword in jd_qualification_keywords
            if contains_keyword(text, keyword)
        ]

        qualification_missing = [
            keyword
            for keyword in jd_qualification_keywords
            if not contains_keyword(text, keyword)
        ]

        qualification_score = calculate_match(
            jd_qualification_keywords,
            qualification_matched
        )

        # ---------------------------------
        # RESPONSIBILITY MATCH
        # ---------------------------------

        responsibility_matched = [
            keyword
            for keyword in jd_responsibility_keywords
            if contains_keyword(text, keyword)
        ]

        responsibility_missing = [
            keyword
            for keyword in jd_responsibility_keywords
            if not contains_keyword(text, keyword)
        ]

        responsibility_score = calculate_match(
            jd_responsibility_keywords,
            responsibility_matched
        )

        # ---------------------------------
        # JOB TITLE MATCH
        # ---------------------------------

        if job_title:

            title_keywords = extract_keywords(
                job_title, "technical_skills"
            )

            if not title_keywords:

                title_keywords = [
                    word
                    for word in re.findall(
                        r"[a-z0-9+#.]+",
                        job_title.lower()
                    )
                    if word not in [
                        "developer", "engineer",
                        "senior", "junior",
                        "software", "job"
                    ]
                ]

            title_matched = [
                keyword
                for keyword in title_keywords
                if contains_keyword(text, keyword)
            ]

            title_score = calculate_match(
                title_keywords,
                title_matched
            )

        else:

            title_score = None

        # ---------------------------------
        # OVERALL JOB MATCH SCORE
        # ---------------------------------

        scores = [
            keyword_score,
            qualification_score,
            responsibility_score
        ]

        if title_score is not None:
            scores.append(title_score)

        match_score = round(
            sum(scores) / len(scores)
        )

        # ---------------------------------
        # PROFESSIONAL SUGGESTIONS
        # ---------------------------------

        suggestions = []

        for check, passed in checks.items():

            if not passed:

                suggestions.append(
                    f"Add or improve your {check} section."
                )

        for keyword in missing_keywords[:5]:

            suggestions.append(
                f"If relevant to your experience, "
                f"consider developing or demonstrating "
                f"{keyword}."
            )

        for keyword in responsibility_missing[:3]:

            suggestions.append(
                f"Add project or work examples demonstrating "
                f"{keyword}, if you have this experience."
            )

        for keyword in qualification_missing[:3]:

            suggestions.append(
                f"Clearly mention your qualification related "
                f"to {keyword}, if applicable."
            )

        if len(resume_text.split()) < 100:

            suggestions.append(
                "Your resume contains limited information. "
                "Add relevant education, projects and experience."
            )

        if not suggestions:

            suggestions.append(
                "Your resume matches the detected professional "
                "keywords. Continue improving your project "
                "descriptions and measurable achievements."
            )

        # ---------------------------------
        # FINAL RESPONSE
        # ---------------------------------

        return jsonify({

            "message": "Advanced ATS check completed successfully.",

            "ats_score": ats_score,

            "passed_checks": passed_checks,

            "total_checks": total_checks,

            "checks": checks,

            "match_score": match_score,

            "keyword_match": keyword_score,

            "job_title_match": title_score,

            "qualifications_match": qualification_score,

            "responsibilities_match": responsibility_score,

            "matched_keywords": matched_keywords,

            "missing_keywords": missing_keywords,

            "qualification_matched": qualification_matched,

            "qualification_missing": qualification_missing,

            "responsibility_matched": responsibility_matched,

            "responsibility_missing": responsibility_missing,

            "suggestions": suggestions

        }), 200

    except Exception as error:

        print("ATS Error:", str(error))

        return jsonify({

            "message": "ATS checking failed.",

            "error": str(error)

        }), 500
    # =====================================================
# RUN FLASK SERVER
# =====================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )