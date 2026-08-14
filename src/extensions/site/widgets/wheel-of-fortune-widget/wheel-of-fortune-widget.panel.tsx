import React, { type FC, useState, useEffect, useCallback } from 'react';
import { widget } from '@wix/editor';
import {
  SidePanel,
  WixDesignSystemProvider,
  Input,
  FormField,
  SectionHelper,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';

const Panel: FC = () => {
  const [campaignId, setCampaignId] = useState('');

  useEffect(() => {
    widget
      .getProp('campaign-id')
      .then((value) => setCampaignId(value || ''))
      .catch((error) => console.error('Failed to fetch campaign-id:', error));
  }, []);

  const handleCampaignIdChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setCampaignId(value);
    widget.setProp('campaign-id', value);
  }, []);

  return (
    <WixDesignSystemProvider>
      <SidePanel width="300" height="100vh">
        <SidePanel.Content noPadding stretchVertically>
          <SidePanel.Field>
            <FormField label="Campaign ID (optional)">
              <Input
                type="text"
                value={campaignId}
                onChange={handleCampaignIdChange}
                placeholder="Uses the active campaign when empty"
                aria-label="Campaign ID"
              />
            </FormField>
          </SidePanel.Field>
        </SidePanel.Content>
        <SidePanel.Footer noPadding>
          <SectionHelper fullWidth appearance="standard" border="topBottom">
            Leave this empty to display the latest active campaign configured in the app dashboard.
          </SectionHelper>
        </SidePanel.Footer>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};

export default Panel;
