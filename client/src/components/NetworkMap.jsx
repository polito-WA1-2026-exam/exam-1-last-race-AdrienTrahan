import { useRef, useMemo, useCallback, useState, useLayoutEffect } from 'react';

const BOX_WIDTH = 250;
const BOX_HEIGHT = 70;
const BOX_PADDING = 10;

const LINE_COLORS = [
    '#ef4444',
    '#3b82f6',
    '#22c55e',
    '#eab308',
    '#a855f7',
    '#f97316',
    '#06b6d4',
    '#ec4899',
];

export function NetworkMap({ stations = [], segments = [] }) {
    const minX = useMemo(() => Math.min(...stations.map((s) => s.x)));
    const minY = useMemo(() => Math.min(...stations.map((s) => s.y)));
    const maxX = useMemo(() => Math.max(...stations.map((s) => s.x)));
    const maxY = useMemo(() => Math.max(...stations.map((s) => s.y)));
    const padX = useMemo(() => (maxX - minX) / 20);
    const padY = useMemo(() => (maxY - minY) / 20);
    const stationIds = useMemo(() =>
        stations.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {}),
    );
    if (!stations.length || !segments.length) return null;
    return (
        <svg
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            viewBox={`0 0 ${100 * (maxX - minX + 2 * padX)} ${100 * (maxY - minY + 2 * padY)}`}
        >
            {segments.map((segment, i) => (
                <line
                    key={i}
                    x1={
                        100 *
                        (stationIds[segment.first_station_id].x - minX + padX)
                    }
                    y1={
                        100 *
                        (stationIds[segment.first_station_id].y - minY + padY)
                    }
                    x2={
                        100 *
                        (stationIds[segment.second_station_id].x - minX + padX)
                    }
                    y2={
                        100 *
                        (stationIds[segment.second_station_id].y - minY + padY)
                    }
                    stroke={LINE_COLORS[segment.line]}
                    strokeWidth={8}
                />
            ))}
            {stations.map((station, i) => (
                <>
                    <circle
                        key={i}
                        cx={100 * (station.x - minX + padX)}
                        cy={100 * (station.y - minY + padY)}
                        r={20}
                        fill={LINE_COLORS[station.line]}
                    />
                    <rect
                        x={
                            100 * (station.x - minX + padX) -
                            BOX_WIDTH / 2 -
                            BOX_PADDING / 2
                        }
                        y={
                            100 * (station.y - minY + padY + 0.75) -
                            BOX_HEIGHT / 2 -
                            BOX_PADDING / 2 -
                            5
                        }
                        width={BOX_WIDTH + BOX_PADDING}
                        height={BOX_HEIGHT + BOX_PADDING}
                        fill="black"
                    />
                    <rect
                        x={100 * (station.x - minX + padX) - BOX_WIDTH / 2}
                        y={
                            100 * (station.y - minY + padY + 0.75) -
                            BOX_HEIGHT / 2 -
                            5
                        }
                        width={BOX_WIDTH}
                        height={BOX_HEIGHT}
                        fill="white"
                    />
                    <text
                        x={100 * (station.x - minX + padX)}
                        y={100 * (station.y - minY + padY + 0.75)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={50}
                        fontWeight="bold"
                        enableBackground={true}
                        backgroundColor={'white'}
                    >
                        {station.name}
                    </text>
                </>
            ))}
        </svg>
    );
}
