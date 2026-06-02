import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { NetworkMap } from '../../../components/NetworkMap.jsx';
import { useGame } from '../../../providers/game-provider.jsx';

export function Execution() {
    const navigate = useNavigate();
    const { game, events } = useGame();
    const [completedEvents, setCompletedEvents] = useState([]);
    const stationIds = useMemo(
        () =>
            (game?.map?.stations ?? []).reduce((acc, station) => {
                acc[station.id] = station;
                return acc;
            }, {}),
        [game],
    );
    const highlightedSegment = useMemo(
        () =>
            (game?.map?.segments ?? []).find(
                (segment) => segment.id === completedEvents[0]?.answer,
            ),
        [completedEvents],
    );
    useEffect(() => {
        let unmounted = false;
        setCompletedEvents([]);
        async function animateEvent(i) {
            if (unmounted) return;
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (unmounted) return;
            setCompletedEvents((completedEvents) => [
                events[i],
                ...completedEvents,
            ]);
            if (i < events.length - 1) {
                animateEvent(i + 1);
            }
        }
        if (events.length) animateEvent(0);
        return () => {
            unmounted = true;
        };
    }, [events]);

    return (
        <div className="fixed inset-0 flex">
            <div className="h-full min-w-0 flex-1 p-2 bg-zinc-500">
                <NetworkMap
                    stations={(game?.map?.stations ?? []).map((station) => ({
                        ...station,
                        highlighted:
                            station.id ===
                                highlightedSegment?.first_station_id ||
                            station.id ===
                                highlightedSegment?.second_station_id,
                    }))}
                    segments={game?.map?.segments ?? []}
                    drawLines={true}
                />
            </div>
            <div className="px-2 border-l-2 w-72 pb-16 relative">
                <h1 className="text-xl mt-2 font-bold">Events</h1>
                <div className="flex justify-between">
                    <h2 className="text-lg mt-2 font-bold">Score:</h2>
                    <p className="text-lg mt-2 font-bold">
                        {completedEvents.reduce(
                            (a, { event }) => a + event.effect,
                            20,
                        )}
                    </p>
                </div>
                {completedEvents.map((event, i) => (
                    <EventCell
                        key={'event-' + i}
                        segment={game.map.segments.find(
                            (s) => s.id === event.answer,
                        )}
                        event={event.event}
                        stationIds={stationIds}
                        larger={i === 0}
                    />
                ))}

                <div className="absolute bottom-0 h-12 inset-x-2">
                    <button
                        onClick={() => navigate('/game/results')}
                        className="py-2 w-full border-2 cursor-pointer bg-blue-400 hover:bg-blue-500 active:bg-blue-700 font-bold box-border"
                    >
                        Results
                    </button>
                </div>
            </div>
        </div>
    );
}

function EventCell({ segment, event, stationIds, larger }) {
    return (
        <>
            <div
                className={
                    'px-3 border-2 mt-2 py-2 transition-all' +
                    (larger ? ' scale-[1.05]' : ' opacity-50')
                }
            >
                <div className="flex justify-between">
                    <p>{event.description}</p>
                    <p>{event.effect}</p>
                </div>
                <div className={'flex transition-all'}>
                    <p className="font-bold mr-2 flex-1 text-left">
                        {stationIds?.[segment?.first_station_id]?.name ?? ''}
                    </p>
                    <p>{'⇔'}</p>
                    <p className="font-bold ml-2 flex-1 text-right">
                        {stationIds?.[segment?.second_station_id]?.name ?? ''}
                    </p>
                </div>
            </div>
        </>
    );
}
