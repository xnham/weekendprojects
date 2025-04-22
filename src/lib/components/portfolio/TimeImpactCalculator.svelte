<script>
  import { onMount } from 'svelte';
  import ImpactShowcase from './ImpactShowcase.svelte';
  
  // Props
  export let project;
  
  // Extract time impact data
  $: impactData = project.impact_data || {};
  $: timeSaved = impactData.time_saved || 30; // in minutes
  $: frequency = impactData.frequency || 'daily';
  $: lifetime = impactData.lifetime || 5; // in years
  
  // State for calculated impact
  let weeklyHours = 0;
  let yearlyDays = 0;
  let lifetimeDays = 0;
  
  // Calculate time savings
  function calculateTimeSavings() {
    // Convert minutes to hours for weekly calculation
    const dailyHours = timeSaved / 60;
    
    // Calculate based on frequency
    switch(frequency) {
      case 'hourly':
        weeklyHours = dailyHours * 8 * 5; // 8 hours per day, 5 days per week
        break;
      case 'daily':
        weeklyHours = dailyHours * 5; // 5 days per week
        break;
      case 'weekly':
        weeklyHours = dailyHours;
        break;
      case 'monthly':
        weeklyHours = dailyHours / 4; // Approximately 4 weeks per month
        break;
      case 'yearly':
        weeklyHours = dailyHours / 52; // 52 weeks per year
        break;
      default:
        weeklyHours = dailyHours * 5; // Default to daily, 5 days per week
    }
    
    // Calculate yearly impact (in days)
    yearlyDays = (weeklyHours * 52) / 24;
    
    // Calculate lifetime impact (in days)
    lifetimeDays = yearlyDays * lifetime;
  }
  
  // Format time for display
  function formatTime(minutes) {
    if (minutes < 60) {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return `${hours} hr${hours !== 1 ? 's' : ''}`;
      } else {
        return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`;
      }
    }
  }
  
  // Format the frequency for display
  function formatFrequency() {
    return frequency;
  }
  
  onMount(() => {
    calculateTimeSavings();
  });
</script>

<ImpactShowcase {project}>
  <div class="time-impact">
    <div class="time-saved">
      <span class="time-value">{formatTime(timeSaved)}</span>
      <span class="time-frequency">{formatFrequency()}</span>
    </div>
    
    <div class="time-projections">
      <div class="projection">
        <div class="value">{weeklyHours.toFixed(1)}</div>
        <div class="label">hours/week</div>
      </div>
      
      <div class="divider"></div>
      
      <div class="projection">
        <div class="value">{yearlyDays.toFixed(1)}</div>
        <div class="label">days/year</div>
      </div>
      
      <div class="divider"></div>
      
      <div class="projection">
        <div class="value">{lifetimeDays.toFixed(1)}</div>
        <div class="label">days/{lifetime} years</div>
      </div>
    </div>
    
    <div class="time-note">
      <p>That's {lifetimeDays.toFixed(1)} full days of my life back!</p>
    </div>
  </div>
</ImpactShowcase>

<style>
  .time-impact {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    gap: 1.5rem;
  }
  
  .time-saved {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .time-value {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--purple-100);
    margin-bottom: 0.2rem;
  }
  
  .time-frequency {
    font-size: 0.9rem;
    color: var(--dark-70);
  }
  
  .time-projections {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: var(--dark-5);
    border-radius: 8px;
  }
  
  .projection {
    flex: 1;
    text-align: center;
  }
  
  .value {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--dark-90);
    margin-bottom: 0.2rem;
  }
  
  .label {
    font-size: 0.8rem;
    color: var(--dark-60);
  }
  
  .divider {
    width: 1px;
    height: 35px;
    background-color: var(--dark-20);
  }
  
  .time-note {
    text-align: center;
    font-style: italic;
  }
  
  .time-note p {
    margin: 0;
    font-size: 0.95rem;
    color: var(--dark-70);
  }
</style> 