import { useRef, useMemo, useState, useEffect, useLayoutEffect } from 'react';

const LINE_COLORS = [
    '#F47F30',
    '#09A457',
    '#FFDD35',
    '#0275B9',
    '#a855f7',
    '#f97316',
    '#06b6d4',
    '#ec4899',
];

export function NetworkMap({ stations = [], segments = [], drawLines = true }) {
    const xs = stations.map((s) => s.x);
    const ys = stations.map((s) => s.y);

    const minX = useMemo(
        () => (stations.length ? Math.min(...xs) : 0),
        [stations],
    );
    const minY = useMemo(
        () => (stations.length ? Math.min(...ys) : 0),
        [stations],
    );
    const maxX = useMemo(
        () => (stations.length ? Math.max(...xs) : 0),
        [stations],
    );
    const maxY = useMemo(
        () => (stations.length ? Math.max(...ys) : 0),
        [stations],
    );

    const padX = useMemo(() => (maxX - minX) / 10, [minX, maxX]);
    const padY = useMemo(() => (maxY - minY) / 10, [minY, maxY]);

    const stationIds = useMemo(() => {
        return stations.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
    }, [stations]);

    const width = useMemo(() => 100 * (maxX - minX + 2 * padX), [maxX, minX]);
    const height = useMemo(() => 100 * (maxY - minY + 2 * padY), [maxY, minY]);

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    const viewBox = useMemo(
        () => ({
            x: pan.x,
            y: pan.y,
            width: width * zoom,
            height: height * zoom,
        }),
        [pan, zoom, width, height],
    );

    const handleWheel = (e) => {
        e.preventDefault();

        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();

        const mouseX = rect.width / 2;
        const mouseY = rect.height / 2;

        const worldX = viewBox.x + (mouseX / rect.width) * viewBox.width;
        const worldY = viewBox.y + (mouseY / rect.height) * viewBox.height;
        const factor = e.deltaY > 0 ? 1.05 : 0.95;
        const nextZoom = Math.max(0.2, Math.min(2, zoom * factor));
        const scale = nextZoom / zoom;
        setZoom(nextZoom);

        setPan((p) => ({
            x: worldX - (worldX - p.x) * scale,
            y: worldY - (worldY - p.y) * scale,
        }));
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();

        const dx =
            (e.clientX - lastMouse.current.x) * (viewBox.width / rect.width);
        const dy =
            (e.clientY - lastMouse.current.y) * (viewBox.height / rect.height);

        lastMouse.current = { x: e.clientX, y: e.clientY };

        setPan((p) => ({
            x: p.x - dx,
            y: p.y - dy,
        }));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (!stations.length || !segments.length) return null;

    return (
        <>
            <button
                onClick={() => {
                    setPan({ x: 0, y: 0 });
                    setZoom(1);
                }}
                className=" absolute bottom-2 right-2 px-4 py-2 border-2 text-white bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600  cursor-pointer font-bold box-border"
            >
                Center
            </button>
            <svg
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid meet"
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={
                    ' select-none ' +
                    (isDragging ? 'cursor-grabbing' : ' cursor-grab')
                }
            >
                {drawLines &&
                    segments.map((segment, i) => (
                        <line
                            key={'segment-' + i}
                            x1={
                                100 *
                                (stationIds[segment.first_station_id].x -
                                    minX +
                                    padX)
                            }
                            y1={
                                100 *
                                (stationIds[segment.first_station_id].y -
                                    minY +
                                    padY)
                            }
                            x2={
                                100 *
                                (stationIds[segment.second_station_id].x -
                                    minX +
                                    padX)
                            }
                            y2={
                                100 *
                                (stationIds[segment.second_station_id].y -
                                    minY +
                                    padY)
                            }
                            stroke={LINE_COLORS[segment.line]}
                            strokeWidth={18}
                        />
                    ))}

                {stations.map((station, i) => (
                    <StationLabel
                        key={'station-' + i}
                        station={station}
                        x={100 * (station.x - minX + padX)}
                        y={100 * (station.y - minY + padY)}
                        zoom={zoom}
                    />
                ))}
            </svg>
        </>
    );
}

function StationLabel({ station, x, y, zoom }) {
    const textRef = useRef(null);
    const [bbox, setBbox] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        if (textRef.current) {
            const { width, height } = textRef.current.getBBox();
            setBbox({ width, height });
        }
    }, [station.name]);

    const paddingX = 20;
    const paddingY = 10;

    const inv = zoom;

    return (
        <g
            transform={`translate(${x}, ${y}) scale(${inv}) translate(${-x}, ${-y})`}
        >
            <rect
                x={x - bbox.width / 2 - paddingX}
                y={y - bbox.height / 2 - paddingY}
                width={bbox.width + paddingX * 2}
                height={bbox.height + paddingY * 2}
                fill={station.highlighted ? 'yellow' : 'white'}
                stroke="black"
            />

            <text
                ref={textRef}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={50}
                fontWeight="bold"
            >
                {station.name}
            </text>
        </g>
    );
}
