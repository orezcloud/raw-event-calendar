'use client';

import React, {useEffect, useRef, useState} from 'react';


interface Coords {
    x: number;
    y: number;
}

interface UnitCoords {
    UX: number;
    UY: number;
}

interface CalProps {
    cols: {}[];
}

export default function Cal(props: CalProps) {

    const node = useRef<HTMLDivElement | null>(null);
    const [unitYHeight] = useState<number>(20);
    const [unitXWidth] = useState<number>(100);

    const [boxes, setBoxes] = useState<{
        UX: number;
        UY: number;
        uHeight: number;
    }[]>([
        {
            UX: 0,
            UY: 0,
            uHeight: 10,
        },
        {
            UX: 2,
            UY: 0,
            uHeight: 10,
        }
    ]);

    return <div className={'position-relative'} ref={node}>
        <div className={'d-flex'}>
            {
                props.cols.map((col, i) => {
                    return (
                        <Column key={i}/>
                    );
                })
            }
        </div>

        {
            boxes.map((box, i) => {
                return (
                    <Box
                        key={i}
                        top={box.UY * unitYHeight}
                        left={box.UX * unitXWidth}
                        onDrag={(mousePosPx, initialMousePosPx, initialBoxPosPx) => {
                            const UX = Math.floor(mousePosPx.x / unitXWidth);
                            // const UYMouse = Math.floor((mousePosPx.y < 0 ? 0 : mousePosPx.y) / unitYHeight);
                            const UYMouse = Math.floor(mousePosPx.y / unitYHeight);
                            const UYIniMouse = Math.floor(initialMousePosPx.y / unitYHeight);
                            const UYIniBox = Math.floor(initialBoxPosPx.y / unitYHeight);
                            const dd = {
                                UY: UYMouse - UYIniMouse + UYIniBox,
                                UX: UX,
                                uHeight: box.uHeight,
                            };

                            const diff = Math.abs(dd.UY - box.UY);

                            if (dd.UY >= 0 && dd.UX >= 0 && diff <= 4) {
                                const newBoxes = [...boxes];
                                newBoxes[i] = dd;
                                setBoxes(newBoxes);
                            }
                        }}
                        heightPx={box.uHeight * unitYHeight}
                        widthPx={1 * unitXWidth}
                        onResize={(heightPx: number) => {
                            const newBoxes = [...boxes];
                            newBoxes[i].uHeight = Math.round(heightPx/ unitYHeight);
                            setBoxes(newBoxes);
                        }}
                    />
                );
            })
        }
    </div>;
}


function Column() {


    return (
        <div
            className={'bg-info'}
            style={{
                height: '500px',
                width: '100px',
            }}
        >
            {
                Array.from(Array(25).keys()).map((i) => {
                    return (
                        <div key={i} className={'sg'} style={{
                            height: '20px',
                            width: '100px',
                        }}>
                            {/*{i}*/}
                        </div>
                    );
                })
            }

            <style jsx={true}>{`
              .rr {
                height: 20px;
                border-bottom: 1px solid black;
              }

              .sg {
                border: .3px solid rgba(93, 93, 93, 0.2);
                user-select: none;
              }
            `}</style>
        </div>
    );
}

interface BoxProps {
    top: number;
    left: number;
    onDrag: (mousePosPx: Coords, initialMousePosPx: Coords, initialBoxPosPx: Coords) => void;
    heightPx: number;
    widthPx: number;
    onResize?: (heightPx: number) => void;
}

function Box(props: BoxProps) {

    const [dragging, setDragging] = useState(false);
    const [enableDragging, setEnableDragging] = useState(false);
    const [position, setPosition] = useState({x: 0, y: 0});
    const [initialMousePosition, setInitialMousePosition] = useState<Coords | undefined>({x: 0, y: 0});
    const [initialBoxPosition, setInitialBoxPosition] = useState<Coords | undefined>({x: 0, y: 0});

    const [resizeDragging, setResizeDragging] = useState(false);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setInitialMousePosition({x: e.clientX, y: e.clientY});
        setInitialBoxPosition({x: props.left, y: props.top});
        setDragging(true);
    };

    const handleResizeMouseDown = (e) => {
        e.preventDefault();
        setInitialMousePosition({x: e.clientX, y: e.clientY});
        setInitialBoxPosition({x: props.left, y: props.top});
        setResizeDragging(true);
    };

    const handleMouseUp = (e) => {
        setDragging(false);
        setEnableDragging(false);
        setResizeDragging(false);

        setInitialMousePosition(undefined);
        setInitialBoxPosition(undefined);
    };

    const handleMouseMove = (e) => {
        const dx = e.clientX;
        const dy = e.clientY;
        if (dragging && enableDragging && !resizeDragging && initialMousePosition) {
            setPosition({x: dx, y: dy});
            if (initialMousePosition && initialBoxPosition) {
                props.onDrag({x: dx, y: dy}, initialMousePosition, initialBoxPosition);
            }
        }
        if (dragging && !enableDragging) {
            if (Math.abs(dx - (initialMousePosition?.x || 0)) > 10 || Math.abs(dy - (initialMousePosition?.y || 0)) > 10)
                setEnableDragging(true);
        }
        if (resizeDragging) {
            props.onResize?.(props.heightPx + (dy - (initialMousePosition?.y || 0)));
        }
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [dragging, position, enableDragging, resizeDragging, initialMousePosition, initialBoxPosition]);

    return (
        <div
            className={'position-absolute bx1'}
            style={{
                height: props.heightPx,
                width: props.widthPx,
                top: props.top < 0 ? 0 : props.top,
                left: props.left < 0 ? 0 : props.left,
            }}
        >
            <div
                onMouseDown={handleMouseDown}
                className={'bg-danger'}
                style={{
                    height: 'calc(100% - 7px)',
                    width: '100%',
                }}
            />
            <div
                style={{
                    bottom: '0',
                    left: '0',
                    height: '7px',
                    width: '100%',
                    backgroundColor: 'black',
                    cursor: 'n-resize',
                }}
                onMouseDown={handleResizeMouseDown}
            />

            <style jsx={true}>{`
              .bx1 {
                transition: all 0.1s ease-in-out;
              }
            `}</style>
        </div>
    );
}

