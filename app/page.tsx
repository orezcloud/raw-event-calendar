'use client';
import Cal from '@/cal';
import {ReactNode} from 'react';


export default function Home() {

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
                    events={[
                        {
                            comp: (
                                <div className={'text-black'}>
                                    <span>Event 1</span>
                                </div>
                            ),
                            UY: 10,
                            UX: 1,
                            UH: 10,
                            BG: 'white',
                        },
                        {
                            comp: (
                                <div className={'text-black'}>
                                    <span>Event 2</span>
                                </div>
                            ),
                            UY: 12,
                            UX: 1,
                            UH: 10,
                            BG: '#ddd',
                        }
                    ]}
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
                    onDrop={(data) => {
                        return true;
                    }}
                />
            </div>
        </main>
    );
}

/*
* todo:
*  events: onDrop, onResizeComplete, onClick
* */
