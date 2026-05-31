import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { getApi } from '../../../lib/network.js';
import { useGame } from '../../../providers/game-provider.jsx';
import { useAuth } from '../../../providers/auth-provider.jsx';
import { ConnectionPanel } from '../../../components/ConnectionPanel.jsx';
import { InstructionPanel } from '../../../components/InstructionPanel.jsx';
import { NetworkMap } from '../../../components/NetworkMap.jsx';

export function Planning() {
    const { game, submit } = useGame();
    const [instructionPanelShowed, setInstructionPanelShowed] = useState(false);
    const [selectedSegments, setSelectedSegments] = useState([]);
    const [endingTime, setEndingTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const stationIds = useMemo(
        () =>
            (game?.map?.stations ?? []).reduce((acc, station) => {
                acc[station.id] = station;
                return acc;
            }, {}),
        [game],
    );

    useEffect(() => {
        setEndingTime(Date.now() + 90 * 1000);
    }, []);

    useEffect(() => {
        if (!endingTime) return;
        const interval = setInterval(() => {
            const diff = endingTime - new Date().getTime();
            setTimeLeft(diff > 0 ? diff : 0);
            if (diff <= 0) {
                submitAnswer();
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endingTime]);

    function submitAnswer() {
        submit(selectedSegments).then(() => {});
    }

    const navigate = useNavigate();
    return (
        <>
            <div className="flex flex-col inset-0 fixed">
                <div className="w-full flex gap-2 justify-between border-b-2 py-2 px-2 relative">
                    <div></div>
                    <div className="h-full flex items-center flex-col absolute pointer-events-none left-1/2 -translate-x-1/2">
                        <p className="text-xs font-bold text-zinc-500">
                            Time left:
                        </p>
                        <p className="font-bold">
                            {Math.ceil(timeLeft / 1000)}s
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={submitAnswer}
                            className="px-4 py-2 border-2 cursor-pointer bg-amber-400 hover:bg-amber-500 active:bg-amber-700 font-bold box-border"
                        >
                            Submit
                        </button>
                    </div>
                </div>
                <div className="flex flex-1 min-h-0">
                    <div className="h-full bg-white-500 w-72 border-r-2 px-2 overflow-y-auto pb-2">
                        <h2 className="mt-2 text-lg sticky font-bold text-black">
                            Available Segments
                        </h2>
                        {(game?.map?.segments ?? [])
                            .filter(({ id }) => !selectedSegments.includes(id))
                            .map((segment) => (
                                <SegmentCell
                                    key={'segment-' + segment.id}
                                    segment={segment}
                                    stationIds={stationIds}
                                    onClick={() =>
                                        setSelectedSegments(
                                            (selectedSegments) => [
                                                ...selectedSegments,
                                                segment.id,
                                            ],
                                        )
                                    }
                                />
                            ))}
                    </div>
                    <div className="flex-1 min-h-0 w-full flex flex-col">
                        <div className="border-b-2 font-bold h-12 flex text-center justify-center items-center px-2">
                            {stationIds?.[game.startStationId]?.name}
                            <span className="mx-4 text-gray-400">➔</span>
                            {stationIds?.[game.endStationId]?.name}
                        </div>
                        <div className="w-full p-2 bg-zinc-500 flex-1 min-h-0">
                            <NetworkMap
                                stations={(game?.map?.stations ?? []).map(
                                    (station) => ({
                                        ...station,
                                        highlighted:
                                            station.id ===
                                                game.startStationId ||
                                            station.id === game.endStationId,
                                    }),
                                )}
                                segments={game?.map?.segments ?? []}
                                drawLines={false}
                            />
                        </div>
                    </div>
                    <div className="h-full bg-white-500 w-72 border-l-2 px-2 overflow-y-auto pb-2">
                        <h2 className="mt-2 text-lg sticky font-bold text-black">
                            My Path
                        </h2>
                        {(game?.map?.segments ?? [])
                            .filter(({ id }) => selectedSegments.includes(id))
                            .map((segment) => (
                                <SegmentCell
                                    key={'segment-' + segment.id}
                                    segment={segment}
                                    stationIds={stationIds}
                                    destructive
                                    onClick={() =>
                                        setSelectedSegments(
                                            (selectedSegments) =>
                                                selectedSegments.filter(
                                                    (id) => id !== segment.id,
                                                ),
                                        )
                                    }
                                />
                            ))}
                    </div>
                </div>
            </div>
        </>
    );
}

function SegmentCell({ segment, stationIds, destructive, onClick }) {
    return (
        <>
            <button
                onClick={onClick}
                className={
                    'w-full flex px-2 border-2 mt-2 py-2 hover:scale-[1.02] transition-all cursor-pointer ' +
                    (destructive
                        ? 'hover:border-red-500 hover:text-red-500!'
                        : 'hover:border-blue-500 hover:text-blue-500!')
                }
            >
                <div className="font-bold mr-2 flex-1 text-left">
                    {stationIds?.[segment.first_station_id]?.name ?? ''}
                </div>
                <div>{'⇔'}</div>
                <div className="font-bold ml-2 flex-1 text-right">
                    {stationIds?.[segment.second_station_id]?.name ?? ''}
                </div>
            </button>
        </>
    );
}
