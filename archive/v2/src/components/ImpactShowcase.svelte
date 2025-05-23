<script lang="ts">
  import TimeImpactCalculator from './TimeImpactCalculator.svelte';
  import MoneyImpactCalculator from './MoneyImpactCalculator.svelte';
  import InsightImpactShowcase from './InsightImpactShowcase.svelte';
  import SanityImpactShowcase from './SanityImpactShowcase.svelte';
  import FunImpactShowcase from './FunImpactShowcase.svelte';
  
  // Updated Project interface with UUID id and order property
  interface Project {
    id: string; // Changed from number to string for UUID
    order: number; // Added to match the renamed column
    title: string;
    status: string;
    show: boolean;
    value: string;
    longDescription: string;
    impact: boolean;
    image: string;
    tools: string[];
    beneficiary: string;
    extraContent?: string | null;
    extraContentLinkText?: string | null;
    linkText?: string | null;
    launchDate?: Date | null;
    beforeImpact?: string | null;
    afterImpact?: string | null;
    
    // Time saved structure with alternativeUses inside
    timeSaved?: {
      hasCalculator: boolean;
      daily?: number;
      weekly?: number;
      alternativeUses?: string[];
    } | null;
    
    // Money saved structure with alternativeUses inside
    moneySaved?: {
      daily?: number;
      weekly?: number;
      alternativeUses?: string[];
    } | null;
  }
  
  export let project: Project;
  
  // Function to determine if we should show a calculator
  function showCalculator() {
    if (project.value === 'time' && project.timeSaved) {
      return 'time';
    } else if (project.value === 'money' && project.moneySaved) {
      return 'money';
    } else if (project.value === 'insight') {
      return 'insight';
    } else if (project.value === 'sanity') {
      return 'sanity';
    } else if (project.value === 'fun') {
      return 'fun';
    }
    return null;
  }
  
  const calculatorType = showCalculator();
  
  // Simplified functions to get alternatives with defaults
  function getTimeAlternatives() {
    return project.timeSaved?.alternativeUses || [
      "hike 220 miles",
      "watch 45 movies",
      "read 18 novels",
      "learn a new language",
      "complete 6 online courses"
    ];
  }
  
  function getMoneyAlternatives() {
    return project.moneySaved?.alternativeUses || [
      "a high-end laptop",
      "a weekend getaway",
      "a year of streaming services",
      "dinner at 12 nice restaurants",
      "300 cups of coffee"
    ];
  }
</script>

<!-- Show the appropriate calculator based on project value type -->
{#if calculatorType === 'time' && project.timeSaved}
  <div class="calculator-wrapper">
    <TimeImpactCalculator 
      daily={project.timeSaved.daily || 0}
      weekly={project.timeSaved.weekly || 0}
      launchDate={project.launchDate || new Date('1900-01-01')}
      alternativeUses={getTimeAlternatives()}
    />
  </div>
{:else if calculatorType === 'money' && project.moneySaved}
  <div class="calculator-wrapper">
    <MoneyImpactCalculator
      daily={project.moneySaved.daily || 0}
      weekly={project.moneySaved.weekly || 0}
      launchDate={project.launchDate || new Date('1900-01-01')}
      alternativeUses={getMoneyAlternatives()}
    />
  </div>
{:else if calculatorType === 'insight'}
  <div class="calculator-wrapper">
    <InsightImpactShowcase 
      beforeImpact={project.beforeImpact || "Before impact description."} 
      afterImpact={project.afterImpact || "After impact description."}
    />
  </div>
{:else if calculatorType === 'sanity'}
  <div class="calculator-wrapper">
    <SanityImpactShowcase 
      beforeImpact={project.beforeImpact || "Before impact description."} 
      afterImpact={project.afterImpact || "After impact description."}
    />
  </div>
{:else if calculatorType === 'fun'}
  <div class="calculator-wrapper">
    <FunImpactShowcase 
      beforeImpact={project.beforeImpact || "Before impact description."} 
      afterImpact={project.afterImpact || "After impact description."}
    />
  </div>
{/if}

<style>
  
  .calculator-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    height: 100%;
    margin: 0;
  }
</style>
