/**
 * Calculate a score based on how well the price fits within the budget
 * @param {number} price - The price of the service
 * @param {number} budget - The user's budget
 * @returns {number} - Score between 0 and 1
 */
const calculateBudgetScore = (price, budget) => {
  if (!price || !budget) return 0.5

  if (price <= budget) {
    // Higher score if the price is below budget but not too low
    // Perfect score if price is 80-100% of budget
    const ratio = price / budget
    if (ratio >= 0.8) return 1
    if (ratio >= 0.6) return 0.9
    if (ratio >= 0.4) return 0.8
    return 0.7 // Price is less than 40% of budget
  } else {
    // Penalize if over budget, score decreases faster as price exceeds budget
    const overBudgetRatio = (price - budget) / budget
    if (overBudgetRatio <= 0.1) return 0.6 // Just slightly over budget
    if (overBudgetRatio <= 0.2) return 0.4
    if (overBudgetRatio <= 0.3) return 0.2
    return 0 // More than 30% over budget
  }
}

/**
 * Calculate a score based on location match
 * @param {string} serviceLocation - The location of the service
 * @param {string} userLocation - The user's preferred location
 * @returns {number} - Score between 0 and 1
 */
const calculateLocationScore = (serviceLocation, userLocation) => {
  if (!userLocation || !serviceLocation) return 0.5

  // Normalize locations for comparison
  const normServiceLoc = serviceLocation.toLowerCase().trim()
  const normUserLoc = userLocation.toLowerCase().trim()

  // Exact match
  if (normServiceLoc === normUserLoc) return 1

  // Check if one contains the other
  if (normServiceLoc.includes(normUserLoc) || normUserLoc.includes(normServiceLoc)) return 0.8

  // Split locations into parts (city, state, etc.)
  const serviceParts = normServiceLoc.split(/[,\s]+/).filter(Boolean)
  const userParts = normUserLoc.split(/[,\s]+/).filter(Boolean)

  // Count matching parts
  const matchCount = serviceParts.filter((part) =>
    userParts.some((userPart) => userPart === part || userPart.includes(part) || part.includes(userPart)),
  ).length

  // Calculate match percentage
  if (matchCount === 0) return 0.2 // Some minimal score for no matches

  const maxParts = Math.max(serviceParts.length, userParts.length)
  return Math.min(0.7, 0.3 + (matchCount / maxParts) * 0.7) // Scale between 0.3 and 0.7
}

/**
 * Calculate a score based on venue capacity vs. guest count
 * @param {number} capacity - The capacity of the venue
 * @param {number} guests - The number of guests
 * @returns {number} - Score between 0 and 1
 */
const calculateCapacityScore = (capacity, guests) => {
  if (!guests || !capacity) return 0.5
  if (guests <= 0 || capacity <= 0) return 0.5

  // Calculate ratio of capacity to guests
  const ratio = capacity / guests

  // Score based on how well the capacity matches the guest count
  if (ratio < 1) return 0.1 // Too small
  if (ratio >= 1 && ratio < 1.1) return 0.9 // Just right
  if (ratio >= 1.1 && ratio < 1.3) return 1 // Perfect range (10-30% extra capacity)
  if (ratio >= 1.3 && ratio < 1.5) return 0.9 // Good
  if (ratio >= 1.5 && ratio < 2) return 0.7 // A bit large
  if (ratio >= 2 && ratio < 3) return 0.5 // Much larger
  return 0.3 // Excessively large
}

/**
 * Calculate a personalization score based on user history
 * @param {Object} service - The service to score
 * @param {Object} userHistory - The user's booking history
 * @returns {number} - Score between 0 and 1
 */
const calculatePersonalizationScore = (service, userHistory) => {
  if (!userHistory || !userHistory.length) return 0.5

  // This would be more sophisticated in a real app
  // For now, just check if user has booked similar services before
  const hasBookedSimilar = userHistory.some((booking) => {
    // Check if any attribute matches
    return (
      booking.location === service.location ||
      booking.price === service.price ||
      (booking.eventType && service.eventTypes && booking.eventType === service.eventTypes)
    )
  })

  return hasBookedSimilar ? 0.8 : 0.5
}

module.exports = {
  calculateBudgetScore,
  calculateLocationScore,
  calculateCapacityScore,
  calculatePersonalizationScore,
}
