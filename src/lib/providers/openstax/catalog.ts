import masterCatalogData from '@/data/openstax/catalog.json';
import { OpenStaxRawRecord, OpenStaxNormalizedRecord } from './types';
import { normalizeOpenStaxRecord } from './normalize';

/**
 * Loads the official OpenStax Master Catalog from repository-controlled JSON manifest
 */
export function loadMasterCatalog(): OpenStaxNormalizedRecord[] {
  const rawRecords = masterCatalogData as OpenStaxRawRecord[];
  return rawRecords.map(normalizeOpenStaxRecord);
}
