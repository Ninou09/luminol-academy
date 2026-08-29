import { describe, expect, it } from 'vitest';

import { getEnquiryCampaignReportingCopy } from './enquiry-campaign-reporting-localization';

describe('enquiry campaign reporting localization', () => {
  it('labels protected campaign volume in every admin locale', () => {
    expect(getEnquiryCampaignReportingCopy('en')).toMatchObject({
      title: '30-day campaign-attributed enquiry mix',
      tagged: 'Tagged campaign enquiries',
      sourceMix: 'Top UTM sources',
      campaignMix: 'Top source + campaign pairs',
    });
    expect(getEnquiryCampaignReportingCopy('fr')).toMatchObject({
      title: 'Répartition des demandes attribuées aux campagnes sur 30 jours',
      tagged: 'Demandes avec balise de campagne',
      sourceMix: 'Principales sources UTM',
      campaignMix: 'Principaux couples source + campagne',
    });
    expect(getEnquiryCampaignReportingCopy('ar')).toMatchObject({
      title: 'توزيع الطلبات المرتبطة بالحملات خلال 30 يومًا',
      tagged: 'طلبات تحمل وسم حملة',
      sourceMix: 'أهم مصادر UTM',
      campaignMix: 'أهم أزواج المصدر + الحملة',
    });
  });

  it('formats atomic campaign pairs without inventing labels', () => {
    expect(
      getEnquiryCampaignReportingCopy('en').campaignPair(
        'instagram',
        'august-psychology',
      ),
    ).toBe('instagram · august-psychology');
  });
});
