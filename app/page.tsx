'use client';
import Cal from '@/cal';
import {ReactNode, useState} from 'react';


export default function Home() {

    const [count, setCount] = useState(0);
    const [events, setEvents] = useState([
        {
            comp: {
                id: 1,
            },
            UY: 10,
            UX: 1,
            UH: 10,
            BG: 'white',
        },
        {
            comp: {
                id: 2,
            },
            UY: 13,
            UX: 1,
            UH: 10,
            BG: '#ccc',
        },
    ]);

    return (
        <main>
            <div style={{
                marginLeft: '200px',
                marginRight: 'auto',
                marginTop: '100px',
            }}>

                <Cal
                    colHeaders={[
                        {
                            header: 'Name',
                        },
                        {
                            header: 'Age',
                        },
                        {
                            header: 'Thing',
                        },
                        {
                            header: 'Thing',
                        },
                    ]}
                    events={events}
                    unitYHeightPx={10}
                    unitXWidthPx={200}
                    yUnitCount={12 * 24}
                    sideRows={(() => {
                        const row: {
                            comp: ReactNode;
                            UY: number;
                        }[] = [];
                        for (let i = 1; i <= 24; i++) {
                            row.push({
                                comp: (
                                    <div>
                                        <span>{i}</span>
                                        <span className={'small text-muted d-block'}>00</span>
                                    </div>
                                ),
                                UY: 12,
                            });
                        }
                        return row;
                    })()}
                    sideRowWidthPx={30}
                    Renderer={Renderer}
                    onDrop={async ({UX, UY, index}) => {
                        if (count) {
                            console.log('------------------ SHOULD RENDER');
                        } else {
                            console.log('------------------');
                        }
                        if (count) {
                            let newEvents = [...events];
                            newEvents[index] = {
                                ...newEvents[index],
                                UX,
                                UY,
                            };
                            setEvents(newEvents);
                            setCount(0);
                            return true;
                        } else {
                            setCount(1);
                            return false;
                        }
                    }}
                    onResizeComplete={async ({UH, index}) => {
                        if (count) {
                            console.log('------------------ SHOULD RENDER');
                        } else {
                            console.log('------------------');
                        }
                        console.log('in', index, 'UH', UH);
                        console.log('ev', events[index]);
                        if (count) {
                            let newEvents = [...events];
                            newEvents[index] = {
                                ...newEvents[index],
                                UH,
                            };
                            setEvents(newEvents);
                            setCount(0);
                            return true;
                        } else {
                            setCount(1);
                            return false;
                        }
                    }}
                />
            </div>
        </main>
    );
}

interface RendererProps {
    id: number;
}

function Renderer(props: RendererProps) {
    return (
        <div>
            <span>{props.id}</span>
            adsf
        </div>
    );
}

/*
* todo:
*  events: onDrop, onResizeComplete, onClick
* */
