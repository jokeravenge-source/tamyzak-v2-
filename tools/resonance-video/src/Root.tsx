import React from 'react';
import {Composition} from 'remotion';
import {Diagram} from './Diagram';
export const Root=()=> <>
<Composition id="tuning" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"tuning"}}/>
<Composition id="reactances" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"reactances"}}/>
<Composition id="impedance" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"impedance"}}/>
<Composition id="phasors" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"phasors"}}/>
<Composition id="phase" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"phase"}}/>
<Composition id="frequency" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"frequency"}}/>
<Composition id="tuning-lc" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"tuning-lc"}}/>
<Composition id="regimes" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"regimes"}}/>
<Composition id="lamp" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"lamp"}}/>
<Composition id="current-curves" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"current-curves"}}/>
<Composition id="bandwidth" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"bandwidth"}}/>
<Composition id="quality" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"quality"}}/>
<Composition id="memory" component={Diagram} width={960} height={720} fps={24} durationInFrames={288} defaultProps={{kind:"memory"}}/>
</>;
