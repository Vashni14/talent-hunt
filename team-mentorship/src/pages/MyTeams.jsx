"use client"

import { useState } from "react"
import {
  FaCalendarAlt,
  FaChartBar,
  FaCheckCircle,
  FaClock,
  FaComments,
  FaEllipsisH,
  FaPlus,
  FaUsers,
  FaVideo,
  FaBook,
  FaTimes,
  FaUserTie,
  FaThumbsUp,
  FaHourglassStart
} from "react-icons/fa"

export default function MyTeams() {
  const [activeTab, setActiveTab] = useState("active")
  const [expandedTeam, setExpandedTeam] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: "",
    project: "",
    description: "",
    deadline: "",
    mentor: ""
  })

  const mentors = [
    { id: "m1", name: "Dr. Alan Turing", role: "Senior Architect" },
    { id: "m2", name: "Dr. Yann LeCun", role: "AI Research Lead" },
    { id: "m3", name: "Grace Hopper", role: "Mobile Tech Lead" },
    { id: "m4", name: "Werner Vogels", role: "Cloud Architect" },
    { id: "m5", name: "Andrew Ng", role: "AI Advisor" }
  ]

  const toggleExpandTeam = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId)
  }

  const handleCreateTeam = () => {
    // In a real app, you would save this to your database/state management
    console.log("Creating new team:", newTeam)
    setShowCreateModal(false)
    setNewTeam({
      name: "",
      project: "",
      description: "",
      deadline: "",
      mentor: ""
    })
  }

  const teams = [
    // Active Teams
    {
      id: "1",
      name: "Web Wizards",
      logo: "/placeholder.svg",
      project: "E-commerce Platform",
      description: "Building a modern e-commerce platform with React, Node.js, and MongoDB.",
      members: [
        { id: "1", name: "Sarah Chen", avatar: "/placeholder.svg", role: "Frontend Developer", skills: ["React", "TypeScript"] },
        { id: "2", name: "Michael Johnson", avatar: "/placeholder.svg", role: "Backend Developer", skills: ["Node.js", "Express"] },
        { id: "3", name: "Emily Rodriguez", avatar: "/placeholder.svg", role: "UI/UX Designer", skills: ["Figma", "Adobe XD"] },
      ],
      mentor: mentors[0],
      progress: 65,
      deadline: "Apr 30, 2025",
      status: "active",
      tasks: {
        total: 24,
        completed: 16,
      },
      meetings: [
        { day: "Monday", time: "10:00 AM", type: "Standup" },
        { day: "Wednesday", time: "2:00 PM", type: "Review" },
        { day: "Friday", time: "4:00 PM", type: "Retrospective" },
      ],
      resources: [
        { name: "Project Docs", type: "document", url: "#" },
        { name: "Design System", type: "design", url: "#" },
      ],
      skillsNeeded: ["MongoDB", "Jest"],
    },
    {
      id: "2",
      name: "Data Dynamos",
      logo: "/placeholder.svg",
      project: "Predictive Analytics Tool",
      description: "Creating a machine learning model for predictive analytics in healthcare.",
      members: [
        { id: "4", name: "David Kim", avatar: "/placeholder.svg", role: "Data Scientist", skills: ["Python", "Pandas"] },
        { id: "5", name: "Priya Patel", avatar: "/placeholder.svg", role: "ML Engineer", skills: ["TensorFlow", "PyTorch"] },
      ],
      mentor: mentors[1],
      progress: 40,
      deadline: "May 15, 2025",
      status: "active",
      tasks: {
        total: 18,
        completed: 7,
      },
      meetings: [
        { day: "Tuesday", time: "9:30 AM", type: "Standup" },
        { day: "Thursday", time: "3:00 PM", type: "Review" },
      ],
      resources: [
        { name: "Research Papers", type: "document", url: "#" },
        { name: "Dataset", type: "data", url: "#" },
      ],
      skillsNeeded: ["Data Visualization", "SQL"],
    },

    // Completed Teams
    {
      id: "3",
      name: "Cloud Crafters",
      logo: "/placeholder.svg",
      project: "Serverless Architecture",
      description: "Implemented a serverless architecture for a high-traffic web application.",
      members: [
        { id: "6", name: "Lisa Wang", avatar: "/placeholder.svg", role: "DevOps Engineer", skills: ["AWS", "Terraform"] },
        { id: "7", name: "Robert Smith", avatar: "/placeholder.svg", role: "Backend Developer", skills: ["Lambda", "DynamoDB"] },
      ],
      mentor: mentors[3],
      progress: 100,
      deadline: "Mar 10, 2025",
      status: "completed",
      tasks: {
        total: 16,
        completed: 16,
      },
      meetings: [
        { day: "Monday", time: "10:00 AM", type: "Standup" },
        { day: "Friday", time: "3:00 PM", type: "Review" },
      ],
      resources: [
        { name: "Architecture Docs", type: "document", url: "#" },
        { name: "Deployment Guide", type: "guide", url: "#" },
      ],
      retrospective: "Project completed 2 weeks ahead of schedule. Team collaboration was excellent, though we faced some initial challenges with CI/CD setup.",
      lessons: [
        "Start infrastructure work earlier in the process",
        "More frequent integration testing would have caught issues sooner",
        "Documentation should be prioritized from day one"
      ],
      successMetrics: {
        performance: "40% improvement",
        cost: "Reduced by 35%",
        reliability: "99.99% uptime"
      }
    },
    {
      id: "4",
      name: "Mobile Masters",
      logo: "/placeholder.svg",
      project: "Fitness Tracking App",
      description: "Developed a cross-platform mobile app for fitness tracking with 500k+ downloads.",
      members: [
        { id: "8", name: "James Wilson", avatar: "/placeholder.svg", role: "Mobile Developer", skills: ["React Native", "Swift"] },
        { id: "9", name: "Alex Johnson", avatar: "/placeholder.svg", role: "Backend Developer", skills: ["Firebase", "Node.js"] },
      ],
      mentor: mentors[2],
      progress: 100,
      deadline: "Feb 15, 2025",
      status: "completed",
      tasks: {
        total: 32,
        completed: 32,
      },
      retrospective: "The app launched successfully with great user feedback. The team worked well together despite tight deadlines.",
      lessons: [
        "More user testing during development would have improved initial UX",
        "Should have allocated more time for App Store review process",
        "Feature creep became an issue mid-project"
      ],
      successMetrics: {
        downloads: "520,000+",
        rating: "4.8/5",
        activeUsers: "78% retention after 30 days"
      }
    },

    // Pending Teams
    {
      id: "5",
      name: "AI Innovators",
      logo: "/placeholder.svg",
      project: "Natural Language Processing",
      description: "Building an NLP system for sentiment analysis on social media data.",
      members: [
        { id: "10", name: "Sophia Garcia", avatar: "/placeholder.svg", role: "AI Researcher", skills: ["Python", "NLTK"] },
        { id: "11", name: "Daniel Lee", avatar: "/placeholder.svg", role: "Data Engineer", skills: ["Spark", "Hadoop"] },
      ],
      mentor: mentors[4],
      progress: 0,
      deadline: "May 20, 2025",
      status: "pending",
      tasks: {
        total: 22,
        completed: 0,
      },
      onboarding: [
        "Complete project kickoff meeting",
        "Set up development environment",
        "Review initial dataset",
        "Establish CI/CD pipeline",
        "Create project documentation"
      ],
      skillsNeeded: ["Transformers", "BERT", "PyTorch"],
      pendingTasks: [
        "Finalize project scope",
        "Approve budget",
        "Assign additional team members"
      ]
    },
    {
      id: "6",
      name: "Blockchain Builders",
      logo: "/placeholder.svg",
      project: "Smart Contract Platform",
      description: "Developing a secure smart contract platform for financial transactions.",
      members: [
        { id: "12", name: "Ethan Moore", avatar: "/placeholder.svg", role: "Blockchain Developer", skills: ["Solidity", "Ethereum"] },
        { id: "13", name: "Olivia Brown", avatar: "/placeholder.svg", role: "Security Engineer", skills: ["Cryptography", "Pen Testing"] },
      ],
      mentor: mentors[0],
      progress: 0,
      deadline: "Jun 10, 2025",
      status: "pending",
      tasks: {
        total: 18,
        completed: 0,
      },
      onboarding: [
        "Security audit requirements",
        "Regulatory compliance review",
        "Infrastructure setup",
        "Team training on new framework"
      ],
      skillsNeeded: ["Rust", "Zero-knowledge Proofs"],
      pendingTasks: [
        "Finalize legal review",
        "Secure testnet access",
        "Hire additional auditor"
      ]
    }
  ]

  const filteredTeams = teams.filter((team) => team.status === activeTab)

  const getProgressBarColor = (team) => {
    if (team.status === "completed") return "bg-green-500"
    if (team.progress > 50) return "bg-yellow-500"
    return "bg-blue-500"
  }

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "active":
        return "You don't have any active teams yet."
      case "completed":
        return "You don't have any completed teams yet."
      case "pending":
        return "You don't have any pending teams yet."
      default:
        return "No teams found."
    }
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Create New Team</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Team Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                  placeholder="Web Wizards"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  value={newTeam.project}
                  onChange={(e) => setNewTeam({...newTeam, project: e.target.value})}
                  placeholder="E-commerce Platform"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  rows={3}
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                  placeholder="Brief description of the project..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
                <input
                  type="date"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  value={newTeam.deadline}
                  onChange={(e) => setNewTeam({...newTeam, deadline: e.target.value})}
                />
              </div>
              
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                className="px-4 py-2 text-sm text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
                disabled={!newTeam.name || !newTeam.project}
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">My Teams</h1>
          <div className="flex gap-3">
            <button 
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              aria-label="Create new team"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus />
              Create New Team
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "active"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("active")}
            aria-current={activeTab === "active" ? "page" : undefined}
          >
            Active Teams
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "completed"
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("completed")}
            aria-current={activeTab === "completed" ? "page" : undefined}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "pending" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("pending")}
            aria-current={activeTab === "pending" ? "page" : undefined}
          >
            Pending
          </button>
        </div>

        {/* Teams List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <div
                key={team.id}
                className={`bg-gray-800 rounded-xl border border-gray-700 overflow-hidden transition-all duration-300 ${
                  expandedTeam === team.id 
                    ? "border-yellow-500 shadow-lg shadow-yellow-500/10" 
                    : "hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <img
                        src={team.logo}
                        alt={`${team.name} logo`}
                        className="w-14 h-14 rounded-lg object-cover border-2 border-yellow-500/30"
                        width={56}
                        height={56}
                      />
                      <div>
                        <h3 className="font-medium text-white text-lg">{team.name}</h3>
                        <p className="text-sm text-yellow-400">{team.project}</p>
                        {team.status === "completed" && (
                          <div className="flex items-center mt-1 text-xs text-green-400">
                            <FaThumbsUp className="mr-1" />
                            <span>Completed</span>
                          </div>
                        )}
                        {team.status === "pending" && (
                          <div className="flex items-center mt-1 text-xs text-blue-400">
                            <FaHourglassStart className="mr-1" />
                            <span>Pending Start</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      className="text-gray-400 hover:text-white p-1"
                      aria-label={`More options for ${team.name}`}
                      onClick={() => toggleExpandTeam(team.id)}
                    >
                      <FaEllipsisH />
                    </button>
                  </div>

                  <p className="mt-4 text-sm text-gray-300">{team.description}</p>

                  {/* Mentor Section - Always visible */}
                  {team.mentor && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-300">
                      <FaUserTie className="text-yellow-400" />
                      <span>Mentor: </span>
                      <span className="text-white">{team.mentor.name}</span>
                      <span className="text-gray-400 text-xs ml-1">({team.mentor.role})</span>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-gray-400">Progress</span>
                      <span className="text-xs text-gray-400">{team.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressBarColor(team)}`}
                        style={{ width: `${team.progress}%` }}
                        aria-valuenow={team.progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center text-xs text-gray-400">
                      <FaUsers className="mr-1" />
                      <span>{team.members.length} members</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <FaCalendarAlt className="mr-1" />
                      <span>Deadline: {team.deadline}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <FaCheckCircle className="mr-1" />
                      <span>
                        {team.tasks.completed}/{team.tasks.total} tasks
                      </span>
                    </div>
                  </div>

                  {/* Expanded Team Details */}
                  {expandedTeam === team.id && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      {/* Team Members with Skills */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-white mb-2">Team Members</h4>
                        <div className="space-y-3">
                          {team.members.map((member) => (
                            <div key={member.id} className="flex items-start gap-3">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-8 h-8 rounded-full border border-gray-600"
                                width={32}
                                height={32}
                              />
                              <div>
                                <p className="text-sm text-white">{member.name}</p>
                                <p className="text-xs text-gray-400">{member.role}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {member.skills.map((skill, index) => (
                                    <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills Needed */}
                      {team.skillsNeeded && team.skillsNeeded.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-white mb-2">Skills Needed</h4>
                          <div className="flex flex-wrap gap-2">
                            {team.skillsNeeded.map((skill, index) => (
                              <span key={index} className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Completed Team Details */}
                      {team.status === "completed" && (
                        <>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-white mb-2">Retrospective</h4>
                            <p className="text-xs text-gray-300 mb-2">{team.retrospective}</p>
                          </div>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-white mb-2">Key Lessons</h4>
                            <ul className="text-xs text-gray-300 space-y-1">
                              {team.lessons.map((lesson, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-1">•</span>
                                  <span>{lesson}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-white mb-2">Success Metrics</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                              {Object.entries(team.successMetrics).map(([metric, value]) => (
                                <div key={metric} className="bg-gray-700/50 p-2 rounded">
                                  <span className="capitalize">{metric}: </span>
                                  <span className="text-white">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Pending Team Details */}
                      {team.status === "pending" && (
                        <>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-white mb-2">Onboarding Tasks</h4>
                            <ul className="text-xs text-gray-300 space-y-2">
                              {team.onboarding.map((task, index) => (
                                <li key={index} className="flex items-start">
                                  <input 
                                    type="checkbox" 
                                    id={`task-${team.id}-${index}`} 
                                    className="mr-2 mt-0.5" 
                                  />
                                  <label htmlFor={`task-${team.id}-${index}`}>{task}</label>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-white mb-2">Pending Tasks</h4>
                            <ul className="text-xs text-gray-300 space-y-1">
                              {team.pendingTasks.map((task, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-1">•</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {/* Meetings */}
                      {team.meetings && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-white mb-2">Meetings</h4>
                          <div className="space-y-2">
                            {team.meetings.map((meeting, index) => (
                              <div key={index} className="flex items-center text-xs text-gray-300">
                                <FaVideo className="mr-2 text-gray-400" />
                                <span>{meeting.day} {meeting.time} - {meeting.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex -space-x-2 mt-4">
                    {team.members.map((member) => (
                      <img
                        key={member.id}
                        src={member.avatar}
                        alt={member.name}
                        title={`${member.name} - ${member.role}`}
                        className="w-8 h-8 rounded-full border-2 border-gray-800"
                        width={32}
                        height={32}
                      />
                    ))}
                    {team.status === "active" && (
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white border-2 border-gray-800"
                        aria-label="Add new member"
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-700 p-3 flex justify-between items-center">
                  <div className="flex gap-3">
                    <button 
                      className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"
                      aria-label="View analytics"
                    >
                      <FaChartBar className="mr-1" />
                      <span>Analytics</span>
                    </button>
                    <button 
                      className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"
                      aria-label="Open team chat"
                    >
                      <FaComments className="mr-1" />
                      <span>Chat</span>
                    </button>
                  </div>
                  <button 
                    className="flex items-center gap-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                    aria-label="View team tasks"
                  >
                    <FaClock className="text-xs" />
                    View Tasks
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
              <p className="text-gray-400">{getEmptyStateMessage()}</p>
              <button 
                className="mt-4 flex items-center gap-1 mx-auto text-yellow-400 hover:text-yellow-300 text-sm px-4 py-2 bg-gray-700 rounded-lg"
                aria-label="Create or join a team"
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus />
                Create New Team
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}