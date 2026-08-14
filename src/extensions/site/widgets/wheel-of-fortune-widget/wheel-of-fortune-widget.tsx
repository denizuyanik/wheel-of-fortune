import React, { type FC } from 'react';
import ReactDOM from 'react-dom/client';
import reactToWebComponent from 'react-to-webcomponent';
import WheelWidget from '../../../../site/widgets/wheel-widget/wheel-widget';
import styles from './wheel-of-fortune-widget.module.css';

type CustomElementProps = {
  campaignId?: string;
};

const WheelOfFortuneElement: FC<CustomElementProps> = ({ campaignId }) => (
  <div className={styles.root}>
    <WheelWidget campaignId={campaignId} />
  </div>
);

export default reactToWebComponent(WheelOfFortuneElement, React, ReactDOM, {
  props: { campaignId: 'string' },
});
