from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one marker, found {count}")
    return text.replace(old, new, 1)


page = Path("apps/admin/app/enquiries/page.tsx")
text = page.read_text()

marker = "import { getEnquiryContactPreferenceFilterCopy } from '../../lib/enquiry-contact-preference-filter-localization';\n"
text = replace_once(
    text,
    marker,
    marker
    + "import { getEnquiryDeliveryPreferenceFilterCopy } from '../../lib/enquiry-delivery-preference-filter-localization';\n",
    "delivery localization import",
)

marker = (
    "import {\n"
    "  getEnquiryContactPreferenceWhere,\n"
    "  parseEnquiryContactPreferenceFilter,\n"
    "  type EnquiryContactPreference,\n"
    "} from '../../lib/enquiry-contact-preference-filter';\n"
)
text = replace_once(
    text,
    marker,
    marker
    + "import {\n"
    + "  getEnquiryDeliveryPreferenceWhere,\n"
    + "  parseEnquiryDeliveryPreferenceFilter,\n"
    + "  type EnquiryDeliveryPreference,\n"
    + "} from '../../lib/enquiry-delivery-preference-filter';\n",
    "delivery filter import",
)

marker = "    preferredContact?: string | string[] | undefined;\n"
text = replace_once(
    text,
    marker,
    marker + "    deliveryPreference?: string | string[] | undefined;\n",
    "delivery search param",
)

marker = "  preferredContact: EnquiryContactPreference | null = null,\n) {\n"
text = replace_once(
    text,
    marker,
    "  preferredContact: EnquiryContactPreference | null = null,\n"
    "  deliveryPreference: EnquiryDeliveryPreference | null = null,\n"
    ") {\n",
    "delivery href argument",
)

marker = "  if (preferredContact) query.set('preferredContact', preferredContact);\n"
text = replace_once(
    text,
    marker,
    marker + "  if (deliveryPreference) query.set('deliveryPreference', deliveryPreference);\n",
    "delivery href query",
)

marker = (
    "  const contactPreferenceFilterCopy =\n"
    "    getEnquiryContactPreferenceFilterCopy(locale);\n"
)
text = replace_once(
    text,
    marker,
    marker
    + "  const deliveryPreferenceFilterCopy =\n"
    + "    getEnquiryDeliveryPreferenceFilterCopy(locale);\n",
    "delivery copy",
)

marker = (
    "  const activeContactPreference = parseEnquiryContactPreferenceFilter(\n"
    "    params?.preferredContact,\n"
    "  );\n"
)
text = replace_once(
    text,
    marker,
    marker
    + "  const activeDeliveryPreference = parseEnquiryDeliveryPreferenceFilter(\n"
    + "    params?.deliveryPreference,\n"
    + "  );\n",
    "delivery parse",
)

marker = "  if (contactPreferenceWhere) filters.push(contactPreferenceWhere);\n"
text = replace_once(
    text,
    marker,
    marker
    + "  const deliveryPreferenceWhere = getEnquiryDeliveryPreferenceWhere(\n"
    + "    activeDeliveryPreference,\n"
    + "  );\n"
    + "  if (deliveryPreferenceWhere) filters.push(deliveryPreferenceWhere);\n",
    "delivery where",
)

marker = "      activeSchool,\n      activeContactPreference,\n    );\n"
text = replace_once(
    text,
    marker,
    "      activeSchool,\n"
    "      activeContactPreference,\n"
    "      activeDeliveryPreference,\n"
    "    );\n",
    "delivery hrefFor scope",
)

clear_markers = [
    (
        "                      activeLandingPath,\n"
        "                      activeSchool,\n"
        "                      activeContactPreference,\n"
        "                    )}\n",
        "                      activeLandingPath,\n"
        "                      activeSchool,\n"
        "                      activeContactPreference,\n"
        "                      activeDeliveryPreference,\n"
        "                    )}\n",
        "campaign clear delivery scope",
    ),
    (
        "                      null,\n"
        "                      activeSchool,\n"
        "                      activeContactPreference,\n"
        "                    )}\n",
        "                      null,\n"
        "                      activeSchool,\n"
        "                      activeContactPreference,\n"
        "                      activeDeliveryPreference,\n"
        "                    )}\n",
        "landing clear delivery scope",
    ),
    (
        "                      activeLandingPath,\n"
        "                      null,\n"
        "                      activeContactPreference,\n"
        "                    )}\n",
        "                      activeLandingPath,\n"
        "                      null,\n"
        "                      activeContactPreference,\n"
        "                      activeDeliveryPreference,\n"
        "                    )}\n",
        "school clear delivery scope",
    ),
    (
        "                      activeLandingPath,\n"
        "                      activeSchool,\n"
        "                      null,\n"
        "                    )}\n",
        "                      activeLandingPath,\n"
        "                      activeSchool,\n"
        "                      null,\n"
        "                      activeDeliveryPreference,\n"
        "                    )}\n",
        "contact clear delivery scope",
    ),
]
for old, new, label in clear_markers:
    text = replace_once(text, old, new, label)

attention_marker = (
    "            <div className={styles.attentionSection}>\n"
    "              <span className={styles.filterLabel}>{copy.attentionQueue}</span>\n"
)
delivery_panel = (
    "            {activeDeliveryPreference ? (\n"
    "              <div className={styles.attentionSection}>\n"
    "                <span className={styles.filterLabel}>\n"
    "                  {deliveryPreferenceFilterCopy.eyebrow}\n"
    "                </span>\n"
    "                <div className={styles.filters}>\n"
    "                  <span className={styles.filterLink}>\n"
    "                    {deliveryPreferenceFilterCopy.preference}:{' '}\n"
    "                    {getEnquiryDeliveryPreferenceLabel(\n"
    "                      locale,\n"
    "                      activeDeliveryPreference,\n"
    "                    )}\n"
    "                  </span>\n"
    "                  <Link\n"
    "                    className={styles.filterLink}\n"
    "                    href={buildEnquiryHref(\n"
    "                      locale,\n"
    "                      activeStatus,\n"
    "                      activeFollowUp,\n"
    "                      activeAttention,\n"
    "                      activeOwner,\n"
    "                      activeCampaignAttribution,\n"
    "                      activeLandingPath,\n"
    "                      activeSchool,\n"
    "                      activeContactPreference,\n"
    "                      null,\n"
    "                    )}\n"
    "                  >\n"
    "                    <span>{deliveryPreferenceFilterCopy.clear}</span>\n"
    "                  </Link>\n"
    "                </div>\n"
    "                <p className={styles.filterLabel}>\n"
    "                  {deliveryPreferenceFilterCopy.intro}\n"
    "                </p>\n"
    "              </div>\n"
    "            ) : null}\n\n"
)
text = replace_once(
    text,
    attention_marker,
    delivery_panel + attention_marker,
    "delivery active panel",
)

for value in [
    "deliveryPreference?: string | string[] | undefined;",
    "activeDeliveryPreference",
    "getEnquiryDeliveryPreferenceWhere",
    "deliveryPreferenceFilterCopy",
    "query.set('deliveryPreference', deliveryPreference)",
]:
    if value not in text:
        raise SystemExit(f"missing expected enquiry-page integration: {value}")
page.write_text(text)


dashboard = Path("apps/admin/app/page.tsx")
dashboard_text = dashboard.read_text()

marker = "import { buildEnquiryContactPreferenceQuery } from '../lib/enquiry-contact-preference-filter';\n"
dashboard_text = replace_once(
    dashboard_text,
    marker,
    marker
    + "import { buildEnquiryDeliveryPreferenceQuery } from '../lib/enquiry-delivery-preference-filter';\n",
    "delivery dashboard import",
)

marker = (
    "                  <article key={item.deliveryPreference}>\n"
    "                    <span>\n"
    "                      {item.deliveryPreference === 'IN_PERSON'\n"
    "                        ? deliveryPreferenceCopy.inPerson\n"
    "                        : item.deliveryPreference === 'ONLINE'\n"
    "                          ? deliveryPreferenceCopy.online\n"
    "                          : item.deliveryPreference === 'FLEXIBLE'\n"
    "                            ? deliveryPreferenceCopy.flexible\n"
    "                            : deliveryPreferenceCopy.notSure}\n"
    "                    </span>\n"
    "                    <strong>{number(item.count)}</strong>\n"
)
replacement = (
    "                  <article key={item.deliveryPreference}>\n"
    "                    <Link\n"
    "                      href={localizeHref(\n"
    "                        locale,\n"
    "                        `/enquiries?${buildEnquiryDeliveryPreferenceQuery(\n"
    "                          item.deliveryPreference,\n"
    "                        )}`,\n"
    "                      )}\n"
    "                    >\n"
    "                      <span>\n"
    "                        {item.deliveryPreference === 'IN_PERSON'\n"
    "                          ? deliveryPreferenceCopy.inPerson\n"
    "                          : item.deliveryPreference === 'ONLINE'\n"
    "                            ? deliveryPreferenceCopy.online\n"
    "                            : item.deliveryPreference === 'FLEXIBLE'\n"
    "                              ? deliveryPreferenceCopy.flexible\n"
    "                              : deliveryPreferenceCopy.notSure}\n"
    "                      </span>\n"
    "                    </Link>\n"
    "                    <strong>{number(item.count)}</strong>\n"
)
dashboard_text = replace_once(
    dashboard_text,
    marker,
    replacement,
    "delivery dashboard drill-down",
)

if "buildEnquiryDeliveryPreferenceQuery" not in dashboard_text:
    raise SystemExit("missing delivery dashboard query builder")
dashboard.write_text(dashboard_text)
