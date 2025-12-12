import { useState, useEffect } from 'react';
import axios from 'axios';
import useJuryOwnRounds from './useJuryOwnRounds';

interface MissingMarksRound {
    id: number;
    round_name: string;
    date: string;
    time: string;
}

const useCheckMissingMarks = (juryId: number | null) => {
    const { rounds, isLoading: roundsLoading } = useJuryOwnRounds();
    const [missingMarksRounds, setMissingMarksRounds] = useState<MissingMarksRound[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkMissingMarks = async () => {
            if (!juryId || roundsLoading || !rounds) {
                setIsLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                // Filter for completed rounds (not upcoming or ongoing)
                const completedRounds = rounds.filter(
                    (round) => !['upcoming', 'ongoing'].includes(round.status)
                );

                const roundsWithMissingMarks: MissingMarksRound[] = [];

                // Check each completed round for missing marks
                for (const round of completedRounds) {
                    // Check marks for team 1
                    const team1Response = await axios.get(
                        `${import.meta.env.VITE_API_URL}/api/oral-marks/`,
                        {
                            params: {
                                team_id: round.team1?.team_id,
                                round_id: round.id,
                                jury_id: juryId,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    // Check marks for team 2
                    const team2Response = await axios.get(
                        `${import.meta.env.VITE_API_URL}/api/oral-marks/`,
                        {
                            params: {
                                team_id: round.team2?.team_id,
                                round_id: round.id,
                                jury_id: juryId,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    // If either team is missing marks, add to the list
                    const team1HasMarks = team1Response.data && team1Response.data.length > 0;
                    const team2HasMarks = team2Response.data && team2Response.data.length > 0;

                    if (!team1HasMarks || !team2HasMarks) {
                        roundsWithMissingMarks.push({
                            id: round.id,
                            round_name: round.round_name,
                            date: round.date,
                            time: round.time,
                        });
                    }
                }

                setMissingMarksRounds(roundsWithMissingMarks);
            } catch (error) {
                console.error('Error checking missing marks:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkMissingMarks();
    }, [rounds, roundsLoading, juryId]);

    return {
        missingMarksRounds,
        isLoading,
        hasMissingMarks: missingMarksRounds.length > 0,
    };
};

export default useCheckMissingMarks;
