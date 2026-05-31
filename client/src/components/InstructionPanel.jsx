import { useState } from 'react';
import { useAuth } from '../providers/auth-provider.jsx';

export function InstructionPanel() {
    return (
        <div className="border-2 border-black bg-white px-6 py-6 h-full overflow-auto">
            <h2 className="mb-5 text-base font-bold text-black">
                Instructions
            </h2>

            <div className="space-y-4 text-sm text-black">
                <p>
                    This is a single-player route planning game set in a
                    fictional underground metro network.
                </p>

                <p>
                    Each game starts with 20 coins. Your goal is to travel from
                    a starting station to a destination station and finish with
                    as many coins as possible.
                </p>

                <div>
                    <h3 className="font-semibold">Game phases</h3>
                    <ul className="list-disc pl-5">
                        <li>Setup: the full metro map is shown.</li>
                        <li>
                            Planning: you receive a start and destination
                            station. You have a limited time to build a route by
                            selecting connected station segments.
                        </li>
                        <li>
                            Execution: each step of your route is evaluated and
                            a random event affects your coins.
                        </li>
                        <li>
                            Result: your final score is shown and stored if you
                            are logged in.
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold">Rules</h3>
                    <ul className="list-disc pl-5">
                        <li>
                            The route must start at the assigned starting
                            station.
                        </li>
                        <li>
                            The route must end at the assigned destination
                            station.
                        </li>
                        <li>
                            Only directly connected stations can be selected in
                            sequence.
                        </li>
                        <li>
                            Line changes are allowed only at interchange
                            stations.
                        </li>
                        <li>
                            If the route is invalid or incomplete, the score
                            becomes zero.
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold">Events</h3>
                    <p>
                        During travel, random events may increase or decrease
                        your coins. Each segment triggers one event with an
                        effect between -4 and +4.
                    </p>
                </div>

                <p>
                    Registered users can play multiple games and appear in the
                    global ranking. Anonymous users can only view these
                    instructions.
                </p>
            </div>
        </div>
    );
}
