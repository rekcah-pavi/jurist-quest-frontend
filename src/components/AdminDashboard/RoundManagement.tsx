import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, Eye, Calendar, Loader2, Trophy } from "lucide-react"
import useAdminRounds, { Round, EligibleTeam } from "@/hooks/useAdminRounds"
import useAdminJuries from "@/hooks/useAdminJuries"
import { useToast } from "@/hooks/use-toast"

const ROUND_CHOICES = [
    { value: 'Prelims', label: 'Prelims' },
    { value: 'Quarter-Finals', label: 'Quarter Finals' },
    { value: 'Semi-Finals', label: 'Semi-Finals' },
    { value: 'Final', label: 'Final' },
]

const ROUND_TYPE_CHOICES = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
]

const RoundManagement = () => {
    const { rounds, isLoading, createRound, updateRound, deleteRound, getEligibleTeams, setWinner, refetch } = useAdminRounds()
    const { juries } = useAdminJuries()
    const { toast } = useToast()

    const [searchTerm, setSearchTerm] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [editingRound, setEditingRound] = useState<Round | null>(null)
    const [deletingRound, setDeletingRound] = useState<Round | null>(null)
    const [viewingRound, setViewingRound] = useState<Round | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSettingWinner, setIsSettingWinner] = useState(false)
    const [isWinnerConfirmOpen, setIsWinnerConfirmOpen] = useState(false)
    const [selectedWinnerId, setSelectedWinnerId] = useState<number | null>(null)

    // Form state
    const [selectedJury, setSelectedJury] = useState<number | null>(null)
    const [selectedRound, setSelectedRound] = useState<string>("")
    const [eligibleTeams, setEligibleTeams] = useState<EligibleTeam[]>([])
    const [loadingTeams, setLoadingTeams] = useState(false)

    const [formData, setFormData] = useState<Partial<Round>>({
        round_name: '',
        team1: null,
        team2: null,
        date: '',
        time: '',
        duration_in_minutes: 60,
        venue: '',
        meet_url: '',
        round_type: 'offline',
    })

    const filteredRounds = rounds.filter(round =>
        round.round_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        round.team1_details?.team_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        round.team2_details?.team_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Fetch eligible teams when round is selected (no jury filter)
    useEffect(() => {
        const fetchEligibleTeams = async () => {
            if (selectedRound) {
                setLoadingTeams(true)
                try {
                    // Don't pass jury_id - show all teams in the previous round
                    const teams = await getEligibleTeams(selectedRound)
                    setEligibleTeams(teams)
                } catch (error: any) {
                    toast({
                        title: "Error",
                        description: error.response?.data?.error || "Failed to fetch eligible teams",
                        variant: "destructive",
                    })
                    setEligibleTeams([])
                } finally {
                    setLoadingTeams(false)
                }
            } else {
                setEligibleTeams([])
            }
        }

        fetchEligibleTeams()
    }, [selectedRound]) // Only depend on selectedRound, not selectedJury

    const handleOpenDialog = (round?: Round) => {
        if (round) {
            setEditingRound(round)
            setFormData({
                round_name: round.round_name,
                team1: round.team1,
                team2: round.team2,
                date: round.date,
                time: round.time,
                duration_in_minutes: round.duration_in_minutes,
                venue: round.venue,
                meet_url: round.meet_url,
                round_type: round.round_type,
            })
            setSelectedRound(round.round_name)
            if (round.judge) {
                setSelectedJury(round.judge.id)
            }
        } else {
            setEditingRound(null)
            setFormData({
                round_name: '',
                team1: null,
                team2: null,
                date: '',
                time: '',
                duration_in_minutes: 60,
                venue: '',
                meet_url: '',
                round_type: 'offline',
            })
            setSelectedJury(null)
            setSelectedRound("")
            setEligibleTeams([])
        }
        setIsDialogOpen(true)
    }

    const handleViewDetails = (round: Round) => {
        setViewingRound(round)
        setIsDetailsOpen(true)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const submitData = {
                ...formData,
                team1: formData.team1,
                team2: formData.team2,
                jury_id: selectedJury, // Send jury_id to backend
            }

            if (editingRound) {
                await updateRound({ id: editingRound.id, data: submitData })
                toast({
                    title: "Success",
                    description: "Round updated successfully",
                })
            } else {
                await createRound(submitData)
                toast({
                    title: "Success",
                    description: "Round created successfully. Jury has been assigned to both teams.",
                })
            }

            // Reset form state
            setEditingRound(null)
            setFormData({
                round_name: '',
                team1: null,
                team2: null,
                date: '',
                time: '',
                duration_in_minutes: 60,
                venue: '',
                meet_url: '',
                round_type: 'offline',
            })
            setSelectedJury(null)
            setSelectedRound("")
            setEligibleTeams([])
            setIsDialogOpen(false)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || error.response?.data?.error || "Failed to save round",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingRound) return
        try {
            await deleteRound(deletingRound.id)
            toast({
                title: "Success",
                description: "Round deleted successfully",
            })
            setIsDeleteDialogOpen(false)
            setDeletingRound(null)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to delete round",
                variant: "destructive",
            })
        }
    }

    const handleSelectWinner = async (winnerId: number) => {
        if (!viewingRound) return

        // Show confirmation dialog first
        setSelectedWinnerId(winnerId)
        setIsWinnerConfirmOpen(true)
    }

    const confirmSelectWinner = async () => {
        if (!viewingRound || !selectedWinnerId) return

        setIsSettingWinner(true)
        try {
            await setWinner({ roundId: viewingRound.id, winnerId: selectedWinnerId })
            // Wait for the data to refresh before closing dialogs
            await refetch()
            toast({
                title: "Success",
                description: "Winner selected successfully",
            })
            // Update the viewing round to reflect the change
            setViewingRound(null)
            setIsDetailsOpen(false)
            setIsWinnerConfirmOpen(false)
            setSelectedWinnerId(null)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to set winner",
                variant: "destructive",
            })
        } finally {
            setIsSettingWinner(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardTitle className="text-2xl font-bold">Round Management</CardTitle>
                            <Button disabled className="bg-[#2d4817] hover:bg-[#1f3210]">
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Round
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Search Skeleton */}
                        <div className="mb-4">
                            <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                        </div>

                        {/* Table Skeleton */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Round</TableHead>
                                        <TableHead>Team 1</TableHead>
                                        <TableHead>Team 2</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(5)].map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-36"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle className="text-2xl font-bold">Round Management</CardTitle>
                        <Button onClick={() => handleOpenDialog()} className="bg-[#2d4817] hover:bg-[#1f3210]">
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Round
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by round name or team ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Round</TableHead>
                                    <TableHead>Team 1</TableHead>
                                    <TableHead>Team 2</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRounds.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500">
                                            No rounds found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRounds.map((round) => (
                                        <TableRow key={round.id}>
                                            <TableCell className="font-medium">{round.round_name}</TableCell>
                                            <TableCell>{round.team1_details?.team_id || 'TBA'}</TableCell>
                                            <TableCell>{round.team2_details?.team_id || 'TBA'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="text-sm">
                                                        {new Date(round.date).toLocaleDateString()} {round.time}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${round.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                                    round.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                                        round.status.startsWith('Winner') ? 'bg-purple-100 text-purple-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {round.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(round)}
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenDialog(round)}
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setDeletingRound(round)
                                                            setIsDeleteDialogOpen(true)
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Round Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Round Details - {viewingRound?.round_name}</DialogTitle>
                    </DialogHeader>
                    {viewingRound && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-semibold text-gray-600">Round Name</Label>
                                    <p className="mt-1">{viewingRound.round_name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold text-gray-600">Status</Label>
                                    <p className="mt-1">{viewingRound.status}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Teams</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-semibold text-gray-600">Team 1</Label>
                                        <p className="mt-1">{viewingRound.team1_details?.team_id || 'TBA'}</p>
                                        {viewingRound.team1_details && (
                                            <p className="text-sm text-gray-500">{viewingRound.team1_details.institution_name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-sm font-semibold text-gray-600">Team 2</Label>
                                        <p className="mt-1">{viewingRound.team2_details?.team_id || 'TBA'}</p>
                                        {viewingRound.team2_details && (
                                            <p className="text-sm text-gray-500">{viewingRound.team2_details.institution_name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Schedule</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-semibold text-gray-600">Date</Label>
                                        <p className="mt-1">{new Date(viewingRound.date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-semibold text-gray-600">Time</Label>
                                        <p className="mt-1">{viewingRound.time}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-semibold text-gray-600">Duration</Label>
                                        <p className="mt-1">{viewingRound.duration_in_minutes} minutes</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-semibold text-gray-600">Type</Label>
                                        <p className="mt-1 capitalize">{viewingRound.round_type}</p>
                                    </div>
                                </div>
                            </div>

                            {(viewingRound.venue || viewingRound.meet_url) && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Location</h3>
                                    {viewingRound.venue && (
                                        <div className="mb-2">
                                            <Label className="text-sm font-semibold text-gray-600">Venue</Label>
                                            <p className="mt-1">{viewingRound.venue}</p>
                                        </div>
                                    )}
                                    {viewingRound.meet_url && (
                                        <div>
                                            <Label className="text-sm font-semibold text-gray-600">Meeting URL</Label>
                                            <p className="mt-1">
                                                <a href={viewingRound.meet_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {viewingRound.meet_url}
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {viewingRound.judge && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Judge</h3>
                                    <p>{viewingRound.judge.name}</p>
                                </div>
                            )}

                            {viewingRound.winner_details && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Winner</h3>
                                    <p className="text-green-600 font-medium">{viewingRound.winner_details.team_id}</p>
                                </div>
                            )}

                            {/* Marks Section - Show if marks exist (even without winner) */}
                            {viewingRound.marks && (viewingRound.marks.team1 || viewingRound.marks.team2) && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Oral Marks</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="text-left p-2 border">Criteria</th>
                                                    {viewingRound.marks.team1 && (
                                                        <th className="text-center p-2 border">{viewingRound.marks.team1.team_id}</th>
                                                    )}
                                                    {viewingRound.marks.team2 && (
                                                        <th className="text-center p-2 border">{viewingRound.marks.team2.team_id}</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="p-2 border">Knowledge of Law</td>
                                                    {viewingRound.marks.team1 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team1.knowledge_of_law}</td>
                                                    )}
                                                    {viewingRound.marks.team2 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team2.knowledge_of_law}</td>
                                                    )}
                                                </tr>
                                                <tr className="bg-gray-50">
                                                    <td className="p-2 border">Application of Law to Facts</td>
                                                    {viewingRound.marks.team1 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team1.application_of_law_to_facts}</td>
                                                    )}
                                                    {viewingRound.marks.team2 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team2.application_of_law_to_facts}</td>
                                                    )}
                                                </tr>
                                                <tr>
                                                    <td className="p-2 border">Ingenuity & Ability to Answer Questions</td>
                                                    {viewingRound.marks.team1 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team1.ingenuity_and_ability_to_answer_questions}</td>
                                                    )}
                                                    {viewingRound.marks.team2 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team2.ingenuity_and_ability_to_answer_questions}</td>
                                                    )}
                                                </tr>
                                                <tr className="bg-gray-50">
                                                    <td className="p-2 border">Persuasiveness</td>
                                                    {viewingRound.marks.team1 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team1.persuasiveness}</td>
                                                    )}
                                                    {viewingRound.marks.team2 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team2.persuasiveness}</td>
                                                    )}
                                                </tr>
                                                <tr>
                                                    <td className="p-2 border">Time Management & Organization</td>
                                                    {viewingRound.marks.team1 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team1.time_management_and_organization}</td>
                                                    )}
                                                    {viewingRound.marks.team2 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team2.time_management_and_organization}</td>
                                                    )}
                                                </tr>
                                                <tr className="bg-gray-50">
                                                    <td className="p-2 border">Style, Poise, Courtesy & Demeanor</td>
                                                    {viewingRound.marks.team1 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team1.style_poise_courtesy_and_demeanor}</td>
                                                    )}
                                                    {viewingRound.marks.team2 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team2.style_poise_courtesy_and_demeanor}</td>
                                                    )}
                                                </tr>
                                                <tr>
                                                    <td className="p-2 border">Language & Presentation</td>
                                                    {viewingRound.marks.team1 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team1.language_and_presentation}</td>
                                                    )}
                                                    {viewingRound.marks.team2 && (
                                                        <td className="text-center p-2 border">{viewingRound.marks.team2.language_and_presentation}</td>
                                                    )}
                                                </tr>
                                                <tr className="bg-[#2d4817] text-white font-bold">
                                                    <td className="p-2 border border-[#2d4817]">Total</td>
                                                    {viewingRound.marks.team1 && (
                                                        <td className="text-center p-2 border border-[#2d4817]">{viewingRound.marks.team1.total}</td>
                                                    )}
                                                    {viewingRound.marks.team2 && (
                                                        <td className="text-center p-2 border border-[#2d4817]">{viewingRound.marks.team2.total}</td>
                                                    )}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Overall Comments */}
                                    {(viewingRound.marks.team1?.overall_comments || viewingRound.marks.team2?.overall_comments) && (
                                        <div className="mt-4 space-y-3">
                                            <h4 className="font-semibold text-sm">Overall Comments</h4>
                                            {viewingRound.marks.team1?.overall_comments && (
                                                <div className="bg-gray-50 p-3 rounded">
                                                    <p className="font-medium text-sm mb-1">{viewingRound.marks.team1.team_id}</p>
                                                    <p className="text-sm text-gray-700">{viewingRound.marks.team1.overall_comments}</p>
                                                </div>
                                            )}
                                            {viewingRound.marks.team2?.overall_comments && (
                                                <div className="bg-gray-50 p-3 rounded">
                                                    <p className="font-medium text-sm mb-1">{viewingRound.marks.team2.team_id}</p>
                                                    <p className="text-sm text-gray-700">{viewingRound.marks.team2.overall_comments}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Winner Selection - Only show if no winner is set yet */}
                                    {!viewingRound.winner && viewingRound.status === 'evaluating' && (
                                        <div className="mt-6 border-t pt-4">
                                            <h4 className="font-semibold mb-3 text-[#2d4817]">Select Winner</h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Review the marks above and select the winner for this round.
                                            </p>
                                            <div className="grid grid-cols-2 gap-4">
                                                {viewingRound.team1_details && (
                                                    <Button
                                                        onClick={() => handleSelectWinner(viewingRound.team1_details!.id)}
                                                        disabled={isSettingWinner}
                                                        className={`h-auto py-4 flex flex-col items-center gap-2 relative ${(viewingRound.marks.team1?.total || 0) > (viewingRound.marks.team2?.total || 0)
                                                            ? 'bg-green-600 hover:bg-green-700 border-2 border-green-400 shadow-lg'
                                                            : 'bg-[#2d4817] hover:bg-[#1f3210]'
                                                            }`}
                                                    >
                                                        {(viewingRound.marks.team1?.total || 0) > (viewingRound.marks.team2?.total || 0) && (
                                                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                                                                Higher Score
                                                            </span>
                                                        )}
                                                        {isSettingWinner ? (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Trophy className="h-5 w-5" />
                                                                <span className="font-semibold">Select {viewingRound.team1_details.team_id}</span>
                                                                <span className="text-xs opacity-90">
                                                                    Total: {viewingRound.marks.team1?.total || 0}
                                                                </span>
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                                {viewingRound.team2_details && (
                                                    <Button
                                                        onClick={() => handleSelectWinner(viewingRound.team2_details!.id)}
                                                        disabled={isSettingWinner}
                                                        className={`h-auto py-4 flex flex-col items-center gap-2 relative ${(viewingRound.marks.team2?.total || 0) > (viewingRound.marks.team1?.total || 0)
                                                            ? 'bg-green-600 hover:bg-green-700 border-2 border-green-400 shadow-lg'
                                                            : 'bg-[#2d4817] hover:bg-[#1f3210]'
                                                            }`}
                                                    >
                                                        {(viewingRound.marks.team2?.total || 0) > (viewingRound.marks.team1?.total || 0) && (
                                                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                                                                Higher Score
                                                            </span>
                                                        )}
                                                        {isSettingWinner ? (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Trophy className="h-5 w-5" />
                                                                <span className="font-semibold">Select {viewingRound.team2_details.team_id}</span>
                                                                <span className="text-xs opacity-90">
                                                                    Total: {viewingRound.marks.team2?.total || 0}
                                                                </span>
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRound ? 'Edit Round' : 'Create New Round'}</DialogTitle>
                        <DialogDescription>
                            {editingRound ? 'Update round information' : 'Select jury and round to see eligible teams'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {editingRound ? (
                            <>
                                {/* Edit Mode - Show round info and editable fields */}
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-semibold text-gray-600">Round</Label>
                                            <p className="mt-1">{editingRound.round_name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-semibold text-gray-600">Judge</Label>
                                            <p className="mt-1">{editingRound.judge?.name || 'Not assigned'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-semibold text-gray-600">Team 1</Label>
                                            <p className="mt-1">{editingRound.team1_details?.team_id || 'TBA'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-semibold text-gray-600">Team 2</Label>
                                            <p className="mt-1">{editingRound.team2_details?.team_id || 'TBA'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Editable Fields */}
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Edit Schedule & Details</h3>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date *</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="time">Time *</Label>
                                            <Input
                                                id="time"
                                                type="time"
                                                value={formData.time}
                                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Duration (minutes) *</Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={formData.duration_in_minutes}
                                                onChange={(e) => setFormData({ ...formData, duration_in_minutes: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="round_type">Round Type *</Label>
                                            <Select
                                                value={formData.round_type}
                                                onValueChange={(value) => setFormData({ ...formData, round_type: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ROUND_TYPE_CHOICES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Conditional Location Field */}
                                    {formData.round_type === 'offline' ? (
                                        <div className="space-y-2">
                                            <Label htmlFor="venue">Venue *</Label>
                                            <Input
                                                id="venue"
                                                value={formData.venue || ''}
                                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                                placeholder="Enter venue location"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label htmlFor="meet_url">Meeting URL *</Label>
                                            <Input
                                                id="meet_url"
                                                type="url"
                                                value={formData.meet_url || ''}
                                                onChange={(e) => setFormData({ ...formData, meet_url: e.target.value })}
                                                placeholder="https://meet.google.com/..."
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Create Mode - Show jury and round selection */}
                                {/* Step 1: Select Jury */}
                                <div className="space-y-2">
                                    <Label htmlFor="jury">Select Jury *</Label>
                                    <Select
                                        value={selectedJury?.toString() || ''}
                                        onValueChange={(value) => {
                                            setSelectedJury(parseInt(value))
                                            setFormData({ ...formData, team1: null, team2: null })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select jury" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {juries.map((jury) => (
                                                <SelectItem key={jury.id} value={jury.id.toString()}>
                                                    {jury.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Step 2: Select Round */}
                                <div className="space-y-2">
                                    <Label htmlFor="round_name">Select Round *</Label>
                                    <Select
                                        value={selectedRound}
                                        onValueChange={(value) => {
                                            setSelectedRound(value)
                                            setFormData({ ...formData, round_name: value, team1: null, team2: null })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select round" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROUND_CHOICES.map((round) => (
                                                <SelectItem key={round.value} value={round.value}>
                                                    {round.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Step 3: Select Teams (only shown when round is selected) */}
                                {selectedRound && (
                                    <>
                                        {loadingTeams ? (
                                            <p className="text-sm text-gray-500">Loading eligible teams...</p>
                                        ) : eligibleTeams.length === 0 ? (
                                            <p className="text-sm text-red-500">No eligible teams found for this round</p>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="team1">Team 1 *</Label>
                                                        <Select
                                                            value={formData.team1?.toString() || ''}
                                                            onValueChange={(value) => setFormData({ ...formData, team1: parseInt(value) })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select team 1" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {eligibleTeams.map((team) => (
                                                                    <SelectItem key={team.id} value={team.id.toString()}>
                                                                        {team.team_id} - {team.institution_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="team2">Team 2 *</Label>
                                                        <Select
                                                            value={formData.team2?.toString() || ''}
                                                            onValueChange={(value) => setFormData({ ...formData, team2: parseInt(value) })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select team 2" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {eligibleTeams.map((team) => (
                                                                    <SelectItem key={team.id} value={team.id.toString()} disabled={team.id === formData.team1}>
                                                                        {team.team_id} - {team.institution_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {/* Schedule */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="date">Date *</Label>
                                                        <Input
                                                            id="date"
                                                            type="date"
                                                            value={formData.date}
                                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="time">Time *</Label>
                                                        <Input
                                                            id="time"
                                                            type="time"
                                                            value={formData.time}
                                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="duration">Duration (minutes) *</Label>
                                                        <Input
                                                            id="duration"
                                                            type="number"
                                                            value={formData.duration_in_minutes}
                                                            onChange={(e) => setFormData({ ...formData, duration_in_minutes: parseInt(e.target.value) })}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="round_type">Round Type *</Label>
                                                        <Select
                                                            value={formData.round_type}
                                                            onValueChange={(value) => setFormData({ ...formData, round_type: value })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {ROUND_TYPE_CHOICES.map((type) => (
                                                                    <SelectItem key={type.value} value={type.value}>
                                                                        {type.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {/* Conditional Location Field */}
                                                {formData.round_type === 'offline' ? (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="venue">Venue *</Label>
                                                        <Input
                                                            id="venue"
                                                            value={formData.venue || ''}
                                                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                                            placeholder="Enter venue location"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="meet_url">Meeting URL *</Label>
                                                        <Input
                                                            id="meet_url"
                                                            type="url"
                                                            value={formData.meet_url || ''}
                                                            onChange={(e) => setFormData({ ...formData, meet_url: e.target.value })}
                                                            placeholder="https://meet.google.com/..."
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-[#2d4817] hover:bg-[#1f3210]"
                            disabled={
                                isSubmitting ||
                                (editingRound
                                    ? (!formData.date || !formData.time ||
                                        (formData.round_type === 'offline' ? !formData.venue : !formData.meet_url))
                                    : (!formData.team1 || !formData.team2 || !formData.date || !formData.time ||
                                        (formData.round_type === 'offline' ? !formData.venue : !formData.meet_url)))
                            }
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {editingRound ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>{editingRound ? 'Update' : 'Create'} Round</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this round? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Winner Confirmation Dialog */}
            <Dialog open={isWinnerConfirmOpen} onOpenChange={setIsWinnerConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Winner Selection</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to select this team as the winner? This action will finalize the round results.
                        </DialogDescription>
                    </DialogHeader>
                    {viewingRound && selectedWinnerId && (
                        <div className="py-4">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <p className="font-semibold text-lg">
                                    {selectedWinnerId === viewingRound.team1_details?.id
                                        ? viewingRound.team1_details?.team_id
                                        : viewingRound.team2_details?.team_id}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Total Marks: {selectedWinnerId === viewingRound.team1_details?.id
                                        ? viewingRound.marks?.team1?.total
                                        : viewingRound.marks?.team2?.total}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Institution: {selectedWinnerId === viewingRound.team1_details?.id
                                        ? viewingRound.team1_details?.institution_name
                                        : viewingRound.team2_details?.institution_name}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsWinnerConfirmOpen(false)
                                setSelectedWinnerId(null)
                            }}
                            disabled={isSettingWinner}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmSelectWinner}
                            className="bg-[#2d4817] hover:bg-[#1f3210]"
                            disabled={isSettingWinner}
                        >
                            {isSettingWinner ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Confirming...
                                </>
                            ) : (
                                'Confirm Winner'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default RoundManagement
