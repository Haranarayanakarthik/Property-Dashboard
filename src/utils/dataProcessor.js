import rawData from '../data/properties.json';

// Ensure data is structured correctly
export const propertiesData = rawData || [];

// Cities list as per requirements
export const CITIES = [
  'Delhi',
  'Mumbai',
  'Pune',
  'Bengaluru',
  'Chennai',
  'Hyderabad',
  'Ahmedabad',
  'Kolkata',
  'Jaipur',
  'Lucknow'
];

/**
 * Compute KPIs for a selected city (tenant).
 * If city is 'All' or empty, returns summary for all records.
 */
export function getKpis(selectedCity = 'All') {
  const filtered = selectedCity === 'All' 
    ? propertiesData 
    : propertiesData.filter(p => p.tenant.toLowerCase() === selectedCity.toLowerCase());

  let totalProperties = filtered.length;
  let totalApproved = 0;
  let totalRejected = 0;
  let totalPending = 0;
  let totalCollection = 0;
  let totalAnnualTax = 0;
  let totalArea = 0;

  filtered.forEach(p => {
    totalArea += p.area_sqft || 0;
    totalAnnualTax += p.annual_tax_inr || 0;

    const status = (p.status || '').trim().toLowerCase();
    if (status === 'approved') {
      totalApproved++;
      totalCollection += p.collection_inr || 0;
    } else if (status === 'rejected') {
      totalRejected++;
    } else if (status === 'pending') {
      totalPending++;
    }
  });

  const collectionEfficiency = totalAnnualTax > 0 
    ? (totalCollection / totalAnnualTax) * 100 
    : 0;

  const averageArea = totalProperties > 0 
    ? totalArea / totalProperties 
    : 0;

  return {
    totalProperties,
    totalApproved,
    totalRejected,
    totalPending,
    totalCollection,
    totalAnnualTax,
    collectionEfficiency: Number(collectionEfficiency.toFixed(2)),
    averageArea: Number(averageArea.toFixed(1))
  };
}

/**
 * Prepares data for comparison charts
 */
export function getCityComparisonData() {
  const cityMap = {};
  
  CITIES.forEach(city => {
    cityMap[city] = {
      city,
      total: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      collection: 0,
      tax: 0,
    };
  });

  propertiesData.forEach(p => {
    const city = p.tenant;
    if (cityMap[city]) {
      cityMap[city].total++;
      const status = (p.status || '').trim().toLowerCase();
      if (status === 'approved') {
        cityMap[city].approved++;
        cityMap[city].collection += p.collection_inr || 0;
      } else if (status === 'rejected') {
        cityMap[city].rejected++;
      } else if (status === 'pending') {
        cityMap[city].pending++;
      }
      cityMap[city].tax += p.annual_tax_inr || 0;
    }
  });

  return Object.values(cityMap).map(data => ({
    ...data,
    collection: Number(data.collection.toFixed(2)),
    tax: Number(data.tax.toFixed(2)),
    collectionEfficiency: data.tax > 0 ? Number(((data.collection / data.tax) * 100).toFixed(1)) : 0
  }));
}

/**
 * Prepares data for property types distribution
 */
export function getPropertyTypeData(selectedCity = 'All') {
  const filtered = selectedCity === 'All' 
    ? propertiesData 
    : propertiesData.filter(p => p.tenant.toLowerCase() === selectedCity.toLowerCase());

  const typeMap = {};
  filtered.forEach(p => {
    const type = p.property_type || 'Unknown';
    if (!typeMap[type]) {
      typeMap[type] = { name: type, value: 0, collection: 0 };
    }
    typeMap[type].value++;
    if ((p.status || '').trim().toLowerCase() === 'approved') {
      typeMap[type].collection += p.collection_inr || 0;
    }
  });

  return Object.values(typeMap).map(d => ({
    ...d,
    collection: Number(d.collection.toFixed(2))
  }));
}

/**
 * Generate a concise, query-optimized text summary of the dataset for the AI prompt.
 * This ensures that the LLM has exact, mathematically verified aggregates for answering
 * quantitative questions about the data.
 */
export function generateAiDatasetSummary() {
  const comparisonData = getCityComparisonData();
  const overall = getKpis('All');
  
  // Calculate top/bottom collections and counts
  const sortedByCollection = [...comparisonData].sort((a, b) => b.collection - a.collection);
  const sortedByPending = [...comparisonData].sort((a, b) => b.pending - a.pending);
  const sortedByRejected = [...comparisonData].sort((a, b) => b.rejected - a.rejected);
  const sortedByTotal = [...comparisonData].sort((a, b) => b.total - a.total);

  // Property types distribution overall
  const propTypes = getPropertyTypeData('All');
  const propTypesSummary = propTypes.map(t => `${t.name}: ${t.value} properties (Rs. ${t.collection.toLocaleString('en-IN')})`).join(', ');

  let summaryText = `SYSTEM CONTEXT - UPYOG PROPERTY TAX DATA SUMMARY\n`;
  summaryText += `==========================================\n`;
  summaryText += `OVERALL SUMMARY:\n`;
  summaryText += `- Total Registered Properties: ${overall.totalProperties}\n`;
  summaryText += `- Total Approved Properties: ${overall.totalApproved}\n`;
  summaryText += `- Total Rejected Properties: ${overall.totalRejected}\n`;
  summaryText += `- Total Pending Properties: ${overall.totalPending}\n`;
  summaryText += `- Total Tax Collected: Rs. ${overall.totalCollection.toFixed(2)} (INR)\n`;
  summaryText += `- Total Annual Tax Demand: Rs. ${overall.totalAnnualTax.toFixed(2)} (INR)\n`;
  summaryText += `- Collection Efficiency: ${overall.collectionEfficiency}%\n`;
  summaryText += `- Property Types Distribution: ${propTypesSummary}\n\n`;

  summaryText += `CITY RANKINGS:\n`;
  summaryText += `- Highest Tax Collection: ${sortedByCollection[0].city} (Rs. ${sortedByCollection[0].collection.toFixed(2)})\n`;
  summaryText += `- Lowest Tax Collection: ${sortedByCollection[sortedByCollection.length - 1].city} (Rs. ${sortedByCollection[sortedByCollection.length - 1].collection.toFixed(2)})\n`;
  summaryText += `- Most Pending Properties: ${sortedByPending[0].city} (${sortedByPending[0].pending} pending)\n`;
  summaryText += `- Most Rejected Properties: ${sortedByRejected[0].city} (${sortedByRejected[0].rejected} rejected)\n`;
  summaryText += `- Most Registered Properties: ${sortedByTotal[0].city} (${sortedByTotal[0].total} total)\n\n`;

  summaryText += `CITY-BY-CITY BREAKDOWN:\n`;
  comparisonData.forEach(c => {
    const approvalRate = c.total > 0 ? ((c.approved / c.total) * 100).toFixed(1) : 0;
    const rejectionRate = c.total > 0 ? ((c.rejected / c.total) * 100).toFixed(1) : 0;
    const pendingRate = c.total > 0 ? ((c.pending / c.total) * 100).toFixed(1) : 0;
    
    summaryText += `${c.city}:\n`;
    summaryText += `  - Total Properties: ${c.total}\n`;
    summaryText += `  - Approved: ${c.approved} (${approvalRate}%)\n`;
    summaryText += `  - Rejected: ${c.rejected} (${rejectionRate}%)\n`;
    summaryText += `  - Pending: ${c.pending} (${pendingRate}%)\n`;
    summaryText += `  - Total Collected: Rs. ${c.collection.toFixed(2)}\n`;
    summaryText += `  - Annual Tax Demand: Rs. ${c.tax.toFixed(2)}\n`;
    summaryText += `  - Collection Efficiency: ${c.collectionEfficiency}%\n`;
  });

  return summaryText;
}
