'use client';

import React, {ReactNode, useEffect, useRef, useState} from 'react';


interface Coords {
    x: number;
    y: number;
}

interface Event {
    comp: {id: number};
    UX: number;
    UY: number;
    UH: number;
    BG?: string;
}

interface DropEvent {
    index: number;
    UX: number;
    UY: number;
}

interface ResizeEvent {
    index: number;
    UH: number;
}

interface CalProps {
    colHeaders: {
        header: string;
    }[];
    sideRows: {
        comp: ReactNode;
        UY: number;
    }[];
    unitYHeightPx: number;
    unitXWidthPx: number;
    yUnitCount: number;
    sideRowWidthPx: number;
    Renderer: ReactNode;
    events: Event[];
    onDrop?: (data: DropEvent) => void;
    onResizeComplete?: (data: ResizeEvent) => void;
}

export default function Cal(props: CalProps) {

    const node = useRef<HTMLDivElement | null>(null);
    const [overlapData, setOverlapData] = useState<{index: number}[][]>([]);
    const [boxes, setBoxes] = useState<Event[]>([]);

    const recalOverlapData = (newBoxes: {UX: number, UY: number, UH: number}[]) => {
        // recalculate all overlaps with new position
        const newOverlapData: {index: number}[][] = [];
        const singles: {index: number}[] = newBoxes.map((box, i) => ({index: i}));

        for (let i = 0; i < singles.length; i++) {
            const single = singles[i];
            const overlaps = [single];
            const virtualHeight = newBoxes[single.index].UH;
            const virtualTop = newBoxes[single.index].UY;
            for (let j = 0; j < singles.length; j++) {
                if (i !== j && newBoxes[single.index].UX === newBoxes[singles[j].index].UX) {
                    const other = singles[j];
                    const otherTop = newBoxes[other.index].UY;
                    const otherHeight = newBoxes[other.index].UH;

                    // if other box is overlapping with virtual box
                    if (!(
                        virtualTop + virtualHeight <= otherTop ||
                        virtualTop >= otherTop + otherHeight
                    )) {
                        overlaps.push(other);
                        // remove other from singles
                        singles.splice(j, 1);
                        // reset j
                        j = 0;
                    }
                }
            }
            if (overlaps.length > 1)
                newOverlapData.push(overlaps);
        }

        setOverlapData(newOverlapData);
    };

    useEffect(() => {
        setBoxes(
            props.events.map((event, i) => {
                return {
                    ...event,
                };
            })
        );
        recalOverlapData(props.events);
    }, [props.events]);

    const Renderer = props.Renderer;

    return (
        <div>
            <div className={'d-flex'} style={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backgroundColor: 'white',
            }}>
                <div style={{
                    width: props.sideRowWidthPx,
                }}>

                </div>
                {
                    props.colHeaders.map((col, i) => {
                        return (
                            <div key={i} style={{
                                width: props.unitXWidthPx,
                                border: '1px solid #ccc',
                                textAlign: 'center',
                            }}>
                                {col.header}
                            </div>
                        );
                    })
                }
            </div>
            <div className={'position-relative'} ref={node}>
                <div className={'d-flex'}>
                    <div style={{
                        width: props.sideRowWidthPx,
                        backgroundColor: '#eee',
                    }}>
                        {
                            props.sideRows.map((col, i) => {
                                return (
                                    <div key={i} style={{
                                        height: col.UY * props.unitYHeightPx,
                                        border: '1px solid #ccc',
                                        textAlign: 'center',
                                    }}>
                                        {col.comp}
                                    </div>
                                );
                            })
                        }
                    </div>
                    {
                        props.colHeaders.map((col, i) => {
                            return (
                                <Column
                                    key={i}
                                    singleXUnitPx={props.unitXWidthPx}
                                    singleYUnitPx={props.unitYHeightPx}
                                    yUnitCount={props.yUnitCount}
                                />
                            );
                        })
                    }
                </div>
                {
                    boxes.map((box, i) => {

                        // if this id is in overlapData
                        let oData: {index: number}[];

                        for (let j = 0; j < overlapData.length; j++) {
                            for (let k = 0; k < overlapData[j].length; k++) {
                                if (overlapData[j][k].index === i) {
                                    oData = overlapData[j];
                                    j = overlapData.length; // break out of outer loop
                                    break;
                                }
                            }
                        }
                        let boxOverlapData: {index: number, size: number};

                        if (oData) {
                            let index;
                            let size = oData.length;
                            for (let j = 0; j < oData.length; j++) {
                                if (oData[j].index === i) {
                                    index = j;
                                }
                            }
                            boxOverlapData = {
                                index: index,
                                size: size,
                            };
                        }

                        return (
                            <Box
                                key={i}
                                top={box.UY * props.unitYHeightPx}
                                left={box.UX * props.unitXWidthPx + props.sideRowWidthPx}
                                overlapData={boxOverlapData}
                                comp={<Renderer {...box.comp}/>}
                                onDrag={(mousePosPx, initialMousePosPx, initialBoxPosPx) => {
                                    //@ts-ignore
                                    const nodePosPx = {
                                        x: node?.current?.getBoundingClientRect().x || 0,
                                        y: node?.current?.getBoundingClientRect().y || 0,
                                    };
                                    const UX = Math.floor(Math.abs(mousePosPx.x - nodePosPx.x - props.sideRowWidthPx) / props.unitXWidthPx);
                                    // const UYMouse = Math.floor((mousePosPx.y < 0 ? 0 : mousePosPx.y) / props.unitYHeightPx);
                                    const UYMouse = Math.floor((mousePosPx.y - nodePosPx.y) / props.unitYHeightPx);
                                    const UYIniMouse = Math.floor((initialMousePosPx.y - nodePosPx.y) / props.unitYHeightPx);
                                    const UYIniBox = Math.floor((initialBoxPosPx.y) / props.unitYHeightPx);

                                    const nextMove = {
                                        ...box,
                                        UY: UYMouse - UYIniMouse + UYIniBox,
                                        UX: UX,
                                    };

                                    const diff = Math.abs(nextMove.UY - box.UY);

                                    if (nextMove.UY >= 0 && nextMove.UX >= 0 && diff <= 4) {
                                        const newBoxes = [...boxes];
                                        newBoxes[i] = nextMove;
                                        setBoxes(newBoxes);

                                        recalOverlapData(newBoxes);
                                    }
                                }}
                                heightPx={box.UH * props.unitYHeightPx}
                                widthPx={1 * props.unitXWidthPx}
                                onResize={(heightPx: number) => {
                                    // let newBoxes = boxes.map((b) => {
                                    //     return {
                                    //         ...b,
                                    //     }
                                    // });
                                    let newBoxes = [...boxes];
                                    newBoxes[i].UH = Math.round(heightPx / props.unitYHeightPx);
                                    setBoxes(newBoxes);
                                    recalOverlapData(newBoxes);
                                }}
                                BG={box.BG}
                                onDrop={async () => {
                                    if (props.onDrop) {
                                        const isDataEventSuccessfullyChanged = await props.onDrop({
                                            index: i,
                                            UX: box.UX,
                                            UY: box.UY,
                                        });
                                        if (!isDataEventSuccessfullyChanged) {
                                            setBoxes(props.events);
                                            recalOverlapData(props.events);
                                        }
                                    }
                                }}
                                onResizeComplete={async function() {
                                    if (props.onResizeComplete) {
                                        const isDataEventSuccessfullyChanged = await props.onResizeComplete({
                                            index: i,
                                            UH: boxes[i].UH,
                                        });
                                        if (!isDataEventSuccessfullyChanged) {
                                            setBoxes(props.events);
                                            recalOverlapData(props.events);
                                        }
                                    }
                                }}
                            />
                        );
                    })
                }
            </div>
        </div>
    );
}

function Column(props: {
                    singleYUnitPx: number;
                    yUnitCount: number;
                    singleXUnitPx: number;
                },
) {

    return (
        <div
            className={''}
            style={{
                height: props.yUnitCount * props.singleYUnitPx,
                width: props.singleXUnitPx,
            }}
        >
            {
                Array.from(Array(props.yUnitCount).keys()).map((i) => {
                    return (
                        <div key={i} className={'sg'} style={{
                            height: props.singleYUnitPx,
                            width: '100%',
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
                border: .3px solid rgba(93, 93, 93, 0.1);
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
    overlapData?: {
        index: number;
        size: number;
    };
    comp: ReactNode;
    BG?: string;
    onDrop?: () => void;
    onResizeComplete?: () => void;
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
        setDragging(false);
    };

    const handleMouseUp = (e) => {
        setEnableDragging(false);
        if (dragging && !resizeDragging && props.onDrop) {
            props.onDrop();
        }

        if (resizeDragging && props.onResizeComplete) {
            props.onResizeComplete();
        }
        setDragging(false);
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

    const getOverlapLeftWidth = () => {

        const overlapData = props.overlapData;
        let width = props.widthPx;
        let left = props.left < 0 ? 0 : props.left;
        if (!overlapData) return {
            width,
            left,
        };

        width = props.widthPx / overlapData.size;
        left = props.left + (width * overlapData.index);

        return {width, left};
    };

    const dragHeight = 7;

    return (
        <div
            className={'position-absolute bx1'}
            style={{
                height: props.heightPx,
                width: getOverlapLeftWidth().width,
                top: props.top < 0 ? 0 : props.top,
                // left: props.left < 0 ? 0 : props.left,
                left: getOverlapLeftWidth().left,
            }}
        >
            <div className={'position-relative h-100'}>

                <div
                    onMouseDown={handleMouseDown}
                    style={{
                        // height: `calc(100% - ${dragHeight}px)`,
                        height: '100%',
                        zIndex: 1,
                        width: '100%',
                        cursor: 'move',
                        border: '1px solid #aaa',
                        borderBottom: 'none',
                        overflow: 'hidden',
                        position: 'relative',
                        // padding: '4px',
                        // paddingLeft: '8px',
                        backgroundColor: props.BG || '#fff',
                    }}
                >
                    {props.comp}

                </div>
                <div
                    style={{
                        // bottom: `-${dragHeight}px`,
                        top: `calc(100% - ${dragHeight}px)`,
                        position: 'absolute',
                        zIndex: 10,
                        left: '0',
                        height: dragHeight,
                        width: '100%',
                        // backgroundColor: props.isBlock ? '#E6E6E6' : '#fff',
                        cursor: 'n-resize',
                        border: '1px solid #aaa',
                        borderTop: 'none',
                    }}
                    onMouseDown={handleResizeMouseDown}
                />
            </div>


            <style jsx={true}>{`
              .bx1 {
                //transition: all 0.05s ease-in-out;
              }
            `}</style>
        </div>
    );
}


// {/*{*/}
// {/*    !props.isBlock && (*/}
// {/*        <>*/}
// {/*            <span className={'text-muted d-block'} style={{*/}
// {/*                fontSize: '11px',*/}
// {/*            }}>*/}
// {/*                11.45 - 12.45*/}
// {/*            </span>*/}
// {/*            <span className={'fw-bold'} style={{*/}
// {/*                fontSize: '15px',*/}
// {/*            }}>*/}
// {/*                Kele Aistrope*/}
// {/*            </span>*/}
// {/*            <span className={'text-muted d-block'} style={{*/}
// {/*                fontSize: '13px',*/}
// {/*            }}>*/}
// {/*                Builder Gel Manicure*/}
// {/*            </span>*/}
// {/*        </>*/}
// {/*    )*/}
// {/*}*/}
// {/*{*/}
// {/*    props.isBlock && (*/}
// {/*        <>*/}
// {/*            <span className={'text-muted d-block'} style={{*/}
// {/*                fontSize: '13px',*/}
// {/*            }}>*/}
// {/*                Launch*/}
// {/*            </span>*/}
// {/*        </>*/}
// {/*    )*/}
// {/*}*/}
// {/*<div*/}
// {/*    style={{*/}
// {/*        position: 'absolute',*/}
// {/*        top: '0',*/}
// {/*        left: '0',*/}
// {/*        bottom: '0',*/}
// {/*        width: '4px',*/}
// {/*        backgroundColor: props.isBlock ? '#B3B3B3' : '#66B476',*/}
// {/*    }}*/}
// {/*/>*/}
