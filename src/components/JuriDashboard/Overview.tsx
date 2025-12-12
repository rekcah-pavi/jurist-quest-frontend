import { Card, CardContent } from "@/components/ui/card"
import { Users, School, Trophy, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import useJuryOverview from "@/hooks/useJuryOverview";
import useJuryOwnRounds from "@/hooks/useJuryOwnRounds";
import JuryOverviewSkeleton from "@/components/skeleton/JuriDashboard/JuryOverviewSkeleton"
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line
} from 'recharts';

const Overview = () => {
  const { overview, isLoading, error } = useJuryOverview();
  const { rounds, isLoading: roundsLoading } = useJuryOwnRounds();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Filter rounds with "evaluating" status
  const evaluatingRounds = rounds?.filter(round => round.status === 'evaluating') || [];

  const registrationEndDate = new Date("2025-12-13T00:00:00")

  const calculateTimeLeft = () => {
    const now = new Date()
    const difference = registrationEndDate.getTime() - now.getTime()

    let newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }

    if (difference > 0) {
      newTimeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }
    setTimeLeft(newTimeLeft)
  }

  useEffect(() => {
    calculateTimeLeft()

    const timer = setInterval(() => {
      calculateTimeLeft()
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (isLoading) {
    return <JuryOverviewSkeleton />
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  const chartData = [
    { name: 'Teams', value: overview.total_teams },
    { name: 'Rounds', value: overview.total_rounds },
    { name: 'Memorials', value: overview.total_memorials },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="bg-[#2d4817] text-white border-0 shadow-lg">
        <CardContent className="p-4 md:p-6">
          {/* Top row: Welcome Back! and Registration Countdown */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Welcome Back Juri Member!</h1>
              <p className="text-green-100 mb-4 md:mb-6 text-sm md:text-base">
                Welcome to your JuristQuest 2025 Juri Dashboard. Evaluate the competition with your chosen team.
              </p>
            </div>

            {/* Registration Ends In Block */}
            <div className="bg-white text-gray-900 border border-[#2d4817] rounded-lg p-3 md:p-4 text-center flex-shrink-0 w-full md:w-auto">
              <p className="text-xs md:text-sm text-gray-900 mb-1">Prelims starts in</p>
              <div className="bg-[#2d4817] text-white rounded-md p-2 mb-2 inline-block min-w-[70px] md:min-w-[80px]">
                <div className="text-2xl md:text-4xl font-bold flex flex-wrap justify-center gap-1 md:gap-2">
                  <span>{timeLeft.days.toString().padStart(2, "0")}D</span>
                  <span>{timeLeft.hours.toString().padStart(2, "0")}H</span>
                  <span>{timeLeft.minutes.toString().padStart(2, "0")}M</span>
                  <span>{timeLeft.seconds.toString().padStart(2, "0")}S</span>
                </div>
              </div>
              <p className="text-xs md:text-sm text-gray-900">at 13th December 2025</p>
            </div>
          </div>

          {/* Second row: Your Competition Progress cards */}
          <div className="mb-4">
            <h3 className="text-base md:text-lg font-semibold mb-3 text-white">Your Competition Progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#2d4817] rounded flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-gray-900">Total Teams</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 md:h-2 w-full bg-gray-200 rounded-full">
                    <div className="h-full w-[80%] bg-[#2d4817] rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">{overview.total_teams} Teams</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#2d4817] rounded flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-gray-900">Total Rounds</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 md:h-2 w-full bg-gray-200 rounded-full">
                    <div className="h-full w-[50%] bg-[#2d4817] rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">{overview.total_rounds} Rounds</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#2d4817] rounded flex items-center justify-center flex-shrink-0">
                    <School className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-gray-900">Total Memorial</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 md:h-2 w-full bg-gray-200 rounded-full">
                    <div className="h-full w-[75%] bg-[#2d4817] rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">{overview.total_memorials} Memorials</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning for Evaluating Rounds */}
      {evaluatingRounds.length > 0 && (
        <Card className="bg-amber-50 border-2 border-amber-500 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 mb-2">
                  Action Required: Submit Marks
                </h3>
                <p className="text-sm text-amber-800 mb-3">
                  The following round{evaluatingRounds.length > 1 ? 's are' : ' is'} awaiting your evaluation. Please submit marks as soon as possible.
                </p>
                <div className="space-y-2">
                  {evaluatingRounds.map((round) => (
                    <div
                      key={round.id}
                      className="bg-white border border-amber-200 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{round.round_name}</p>
                        <p className="text-sm text-gray-600">
                          {round.date} at {round.time}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                        Evaluating
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-700 mt-3">
                  💡 Go to the <strong>Rounds</strong> tab to submit your marks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Section - Moved outside the green card */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-900">Overview Statistics</h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 15,
                  left: 0,
                  bottom: 5,
                }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2d4817"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Overview
