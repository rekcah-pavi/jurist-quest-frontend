"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, MapPin, Save, RefreshCw, ChevronLeft } from "lucide-react"
import { useState } from "react"

// Demo data for a specific match to be scored
const matchToScore = {
  match_id: "QF-002", // Ongoing match from your data
  match_name: "Quarter Final 2",
  court_room: "Court B",
  date: "2025-09-25",
  time: "11:30",
  status: "ongoing",
  applicant_team: {
    team_code: "JQ2025-002",
    team_name: "Justice Warriors",
    university: "University of Peradeniya",
    seed: 2,
    previous_score: 83.8,
    participants: [
      { name: "Dilshan Wickramasinghe", role: "Lead Counsel" },
      { name: "Priya Kumari", role: "Co-Counsel" },
      { name: "Chathura Mendis", role: "Researcher" },
      { name: "Shalini Rathnayake", role: "Researcher" },
    ],
  },
  respondent_team: {
    team_code: "JQ2025-007",
    team_name: "Verdict Vanguards",
    university: "University of Sri Jayewardenepura",
    seed: 7,
    previous_score: 79.6,
    participants: [
      { name: "Hasitha Amarasinghe", role: "Lead Counsel" },
      { name: "Tharushi Pathirana", role: "Co-Counsel" },
      { name: "Buddhika Silva", role: "Researcher" },
      { name: "Nethmi Gunathilake", role: "Researcher" },
    ],
  },
  judges: [
    { name: "Hon. Justice A.H.M.D. Nawaz", title: "Supreme Court Judge", judge_id: "J001" },
    { name: "Hon. Justice P.R. Walgampaya", title: "Court of Appeal Judge", judge_id: "J002" },
    { name: "Ms. Manisha Gunasekera", title: "President's Counsel", judge_id: "J003" },
  ],
  case_details: {
    case_title: "Constitutional Rights Violation",
    case_number: "QF2025/002",
    time_limit: "45 minutes per side",
  },
}

// Demo marking criteria (common for Jessup)
const markingCriteria = [
  {
    id: "oral_presentation",
    name: "Oral Presentation",
    description: "Clarity, confidence, and persuasiveness of argument",
    max_points: 30,
    sub_criteria: [
      { id: "clarity", name: "Clarity of Argument", max_points: 10 },
      { id: "confidence", name: "Confidence and Poise", max_points: 10 },
      { id: "persuasiveness", name: "Persuasiveness", max_points: 10 },
    ],
  },
  {
    id: "legal_knowledge",
    name: "Legal Knowledge and Research",
    description: "Understanding of relevant law and use of authorities",
    max_points: 25,
    sub_criteria: [
      { id: "understanding", name: "Understanding of Law", max_points: 10 },
      { id: "authorities", name: "Use of Legal Authorities", max_points: 10 },
      { id: "relevance", name: "Relevance of Research", max_points: 5 },
    ],
  },
  {
    id: "response",
    name: "Response to Questions",
    description: "Ability to answer judges' questions effectively",
    max_points: 25,
    sub_criteria: [
      { id: "accuracy", name: "Accuracy of Answers", max_points: 10 },
      { id: "composure", name: "Composure Under Pressure", max_points: 10 },
      { id: "relevance_q", name: "Relevance to Question", max_points: 5 },
    ],
  },
  {
    id: "structure",
    name: "Structure and Logic",
    description: "Logical flow and organization of arguments",
    max_points: 10,
    sub_criteria: [
      { id: "flow", name: "Logical Flow", max_points: 5 },
      { id: "organization", name: "Organization", max_points: 5 },
    ],
  },
  {
    id: "time_management",
    name: "Time Management",
    description: "Effective use of allocated time",
    max_points: 5,
    sub_criteria: [],
  },
  {
    id: "professionalism",
    name: "Professionalism",
    description: "Etiquette, respect, and adherence to court procedures",
    max_points: 5,
    sub_criteria: [],
  },
]

// Initial state for scores
const initialScoresState = () => {
  const state = {}
  markingCriteria.forEach((criterion) => {
    state[criterion.id] = {
      points: "",
      comment: "",
      sub_scores: {},
    }
    criterion.sub_criteria.forEach((sub) => {
      state[criterion.id].sub_scores[sub.id] = {
        points: "",
        comment: "",
      }
    })
  })
  return state
}

const MarksEntryPage = () => {
  const [applicantScores, setApplicantScores] = useState(initialScoresState())
  const [respondentScores, setRespondentScores] = useState(initialScoresState())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  const handleScoreChange = (team, criterionId, subCriterionId, field, value) => {
    const setter = team === "applicant" ? setApplicantScores : setRespondentScores
    setter((prev) => {
      const newState = JSON.parse(JSON.stringify(prev)) // Deep copy
      if (subCriterionId) {
        newState[criterionId].sub_scores[subCriterionId][field] = value
      } else {
        newState[criterionId][field] = value
      }
      return newState
    })
  }

  const calculateTotal = (scores) => {
    return Object.values(scores).reduce((total, criterion) => {
      const mainPoints = Number.parseFloat(criterion.points) || 0
      const subPoints = Object.values(criterion.sub_scores).reduce(
        (subTotal, sub) => subTotal + (Number.parseFloat(sub.points) || 0),
        0,
      )
      return total + mainPoints + subPoints
    }, 0)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitMessage("")

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay
      console.log("Scores submitted for Match:", matchToScore.match_id)
      console.log("Applicant Scores:", applicantScores)
      console.log("Respondent Scores:", respondentScores)
      setSubmitMessage("Scores submitted successfully!")
      // In a real app, you would send this data to your backend API
    } catch (error) {
      console.error("Error submitting scores:", error)
      setSubmitMessage("Error submitting scores. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setApplicantScores(initialScoresState())
    setRespondentScores(initialScoresState())
    setSubmitMessage("")
  }

  const handleGoBack = () => {
      window.location.href = "/juri-dashboard?view=team"
    
  }

  const applicantTotal = calculateTotal(applicantScores)
  const respondentTotal = calculateTotal(respondentScores)

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2d4817] to-[#3d5a1f] rounded-lg p-6 text-white relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 text-white hover:bg-white/20 hover:text-white"
          onClick={handleGoBack}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Back to Dashboard</span>
        </Button>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Marks Entry</h1>
          <p className="text-lg opacity-90">Jessup Moot Court Competition 2025</p>
          <p className="text-sm opacity-75">
            {matchToScore.match_name} - {matchToScore.case_details.case_title}
          </p>
        </div>
      </div>

      {/* Match Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{matchToScore.match_name}</h2>
              <p className="text-gray-600">{matchToScore.case_details.case_title}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {matchToScore.court_room}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(matchToScore.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(`2025-01-01T${matchToScore.time}:00`).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <Clock className="h-4 w-4" />
              Ongoing
            </div>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800">Applicant Team</h3>
              <p className="font-medium">{matchToScore.applicant_team.team_name}</p>
              <p className="text-sm text-gray-600">{matchToScore.applicant_team.university}</p>
              <div className="mt-2 text-sm">
                <p className="font-medium">Team Members:</p>
                <ul className="list-disc list-inside">
                  {matchToScore.applicant_team.participants.map((member, idx) => (
                    <li key={idx} className="text-gray-600">
                      {member.name} ({member.role})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800">Respondent Team</h3>
              <p className="font-medium">{matchToScore.respondent_team.team_name}</p>
              <p className="text-sm text-gray-600">{matchToScore.respondent_team.university}</p>
              <div className="mt-2 text-sm">
                <p className="font-medium">Team Members:</p>
                <ul className="list-disc list-inside">
                  {matchToScore.respondent_team.participants.map((member, idx) => (
                    <li key={idx} className="text-gray-600">
                      {member.name} ({member.role})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Criteria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applicant Team Scoring */}
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800">Score Applicant Team</CardTitle>
            <p className="text-sm text-blue-600">{matchToScore.applicant_team.team_name}</p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {markingCriteria.map((criterion) => (
              <div key={`applicant-${criterion.id}`} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{criterion.name}</h3>
                    <p className="text-xs text-gray-500">{criterion.description}</p>
                  </div>
                  <div className="text-right">
                    <Input
                      type="number"
                      min="0"
                      max={criterion.max_points}
                      placeholder="0"
                      className="w-20 text-right"
                      value={applicantScores[criterion.id]?.points || ""}
                      onChange={(e) => handleScoreChange("applicant", criterion.id, null, "points", e.target.value)}
                    />
                    <p className="text-xs text-gray-500">/ {criterion.max_points}</p>
                  </div>
                </div>
                <Textarea
                  placeholder="Comments (optional)"
                  className="mt-2 text-sm"
                  value={applicantScores[criterion.id]?.comment || ""}
                  onChange={(e) => handleScoreChange("applicant", criterion.id, null, "comment", e.target.value)}
                />
                {/* Sub-criteria */}
                {criterion.sub_criteria.length > 0 && (
                  <div className="mt-3 pl-4 space-y-3">
                    {criterion.sub_criteria.map((sub) => (
                      <div key={`applicant-${criterion.id}-${sub.id}`} className="flex justify-between items-center">
                        <Label htmlFor={`applicant-${criterion.id}-${sub.id}`} className="text-sm text-gray-700">
                          {sub.name}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`applicant-${criterion.id}-${sub.id}`}
                            type="number"
                            min="0"
                            max={sub.max_points}
                            placeholder="0"
                            className="w-16 text-right text-sm"
                            value={applicantScores[criterion.id]?.sub_scores?.[sub.id]?.points || ""}
                            onChange={(e) =>
                              handleScoreChange("applicant", criterion.id, sub.id, "points", e.target.value)
                            }
                          />
                          <span className="text-xs text-gray-500">/ {sub.max_points}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Respondent Team Scoring */}
        <Card>
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-800">Score Respondent Team</CardTitle>
            <p className="text-sm text-red-600">{matchToScore.respondent_team.team_name}</p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {markingCriteria.map((criterion) => (
              <div key={`respondent-${criterion.id}`} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{criterion.name}</h3>
                    <p className="text-xs text-gray-500">{criterion.description}</p>
                  </div>
                  <div className="text-right">
                    <Input
                      type="number"
                      min="0"
                      max={criterion.max_points}
                      placeholder="0"
                      className="w-20 text-right"
                      value={respondentScores[criterion.id]?.points || ""}
                      onChange={(e) => handleScoreChange("respondent", criterion.id, null, "points", e.target.value)}
                    />
                    <p className="text-xs text-gray-500">/ {criterion.max_points}</p>
                  </div>
                </div>
                <Textarea
                  placeholder="Comments (optional)"
                  className="mt-2 text-sm"
                  value={respondentScores[criterion.id]?.comment || ""}
                  onChange={(e) => handleScoreChange("respondent", criterion.id, null, "comment", e.target.value)}
                />
                {/* Sub-criteria */}
                {criterion.sub_criteria.length > 0 && (
                  <div className="mt-3 pl-4 space-y-3">
                    {criterion.sub_criteria.map((sub) => (
                      <div key={`respondent-${criterion.id}-${sub.id}`} className="flex justify-between items-center">
                        <Label htmlFor={`respondent-${criterion.id}-${sub.id}`} className="text-sm text-gray-700">
                          {sub.name}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`respondent-${criterion.id}-${sub.id}`}
                            type="number"
                            min="0"
                            max={sub.max_points}
                            placeholder="0"
                            className="w-16 text-right text-sm"
                            value={respondentScores[criterion.id]?.sub_scores?.[sub.id]?.points || ""}
                            onChange={(e) =>
                              handleScoreChange("respondent", criterion.id, sub.id, "points", e.target.value)
                            }
                          />
                          <span className="text-xs text-gray-500">/ {sub.max_points}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Totals and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="grid grid-cols-2 gap-8 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">Applicant Total</p>
                <p className="text-3xl font-bold text-blue-900">{applicantTotal.toFixed(1)}</p>
                <p className="text-xs text-gray-500">/ 100</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700">Respondent Total</p>
                <p className="text-3xl font-bold text-red-900">{respondentTotal.toFixed(1)}</p>
                <p className="text-xs text-gray-500">/ 100</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={handleReset} disabled={isSubmitting}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Scores
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#2d4817] hover:bg-[#3d5a1f]">
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Submit Scores
                  </>
                )}
              </Button>
            </div>
          </div>

          {submitMessage && (
            <div
              className={`mt-4 p-3 rounded text-center ${
                submitMessage.includes("successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {submitMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Footer */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600 text-center">
            Enter scores for each criterion and sub-criterion for both teams. Click "Submit Scores" when finished.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default MarksEntryPage
