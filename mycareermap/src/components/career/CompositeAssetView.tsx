import React from 'react';
import type { ToolDefinition } from '../../types/careerDiscovery';

interface CompositeAssetViewProps {
  tool: ToolDefinition;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
}

/**
 * Returns a unique, specific icon for each individual instrument
 */
function getSpecificInstrumentIcon(tool: ToolDefinition): { icon: string; bgGradient: string; iconColor: string } {
  const name = tool.name.toLowerCase();
  const id = tool.id.toLowerCase();

  // Electrical tools
  if (name.includes('multimeter') || id.includes('multimeter')) {
    return { icon: 'electrical_services', bgGradient: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-500' };
  }
  if (name.includes('megohmmeter') || name.includes('insulation') || id.includes('megohmmeter')) {
    return { icon: 'flash_on', bgGradient: 'from-amber-600/20 to-red-600/20', iconColor: 'text-amber-600' };
  }
  if (name.includes('clamp meter') || id.includes('clamp')) {
    return { icon: 'sensors', bgGradient: 'from-yellow-500/20 to-amber-500/20', iconColor: 'text-yellow-600' };
  }
  if (name.includes('non-contact') || name.includes('ncv') || id.includes('ncv')) {
    return { icon: 'flashlight_on', bgGradient: 'from-orange-500/20 to-amber-500/20', iconColor: 'text-orange-500' };
  }
  if (name.includes('screwdriver') || id.includes('screwdriver')) {
    return { icon: 'handyman', bgGradient: 'from-blue-500/20 to-indigo-500/20', iconColor: 'text-blue-500' };
  }
  if (name.includes('pliers') || id.includes('pliers')) {
    return { icon: 'content_cut', bgGradient: 'from-slate-500/20 to-zinc-600/20', iconColor: 'text-slate-600' };
  }
  if (name.includes('wire stripper') || name.includes('stripper') || id.includes('stripper')) {
    return { icon: 'cable', bgGradient: 'from-cyan-500/20 to-blue-500/20', iconColor: 'text-cyan-600' };
  }
  if (name.includes('crimper') || id.includes('crimper')) {
    return { icon: 'compress', bgGradient: 'from-slate-600/20 to-blue-700/20', iconColor: 'text-slate-700' };
  }
  if (name.includes('loto') || name.includes('padlock') || id.includes('loto')) {
    return { icon: 'lock', bgGradient: 'from-rose-500/20 to-red-600/20', iconColor: 'text-rose-600' };
  }
  if (name.includes('phase') || id.includes('phase')) {
    return { icon: 'sync', bgGradient: 'from-indigo-500/20 to-purple-500/20', iconColor: 'text-indigo-600' };
  }
  if (name.includes('earth') || id.includes('earth')) {
    return { icon: 'public', bgGradient: 'from-emerald-500/20 to-teal-600/20', iconColor: 'text-emerald-600' };
  }
  if (name.includes('thermal') || name.includes('imager') || id.includes('thermal')) {
    return { icon: 'thermostat', bgGradient: 'from-rose-500/20 to-orange-500/20', iconColor: 'text-rose-500' };
  }
  if (name.includes('tone') || name.includes('tracer') || id.includes('tone')) {
    return { icon: 'podcasts', bgGradient: 'from-sky-500/20 to-indigo-500/20', iconColor: 'text-sky-500' };
  }
  if (name.includes('arc') || name.includes('shield') || id.includes('shield')) {
    return { icon: 'masks', bgGradient: 'from-amber-500/20 to-yellow-600/20', iconColor: 'text-amber-600' };
  }

  // Mechanical tools
  if (name.includes('caliper') || id.includes('caliper')) {
    return { icon: 'straighten', bgGradient: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-500' };
  }
  if (name.includes('micrometer') || id.includes('micrometer')) {
    return { icon: 'view_in_ar', bgGradient: 'from-teal-500/20 to-cyan-500/20', iconColor: 'text-teal-600' };
  }
  if (name.includes('torque wrench') || id.includes('torque')) {
    return { icon: 'build', bgGradient: 'from-emerald-600/20 to-green-600/20', iconColor: 'text-emerald-600' };
  }
  if (name.includes('dial') || name.includes('runout') || id.includes('dial')) {
    return { icon: 'speed', bgGradient: 'from-cyan-500/20 to-sky-500/20', iconColor: 'text-cyan-500' };
  }
  if (name.includes('feeler') || id.includes('feeler')) {
    return { icon: 'layers', bgGradient: 'from-slate-500/20 to-indigo-500/20', iconColor: 'text-indigo-500' };
  }
  if (name.includes('tachometer') || id.includes('tachometer')) {
    return { icon: 'av_timer', bgGradient: 'from-violet-500/20 to-purple-500/20', iconColor: 'text-violet-500' };
  }
  if (name.includes('puller') || id.includes('puller')) {
    return { icon: 'hardware', bgGradient: 'from-zinc-500/20 to-slate-600/20', iconColor: 'text-zinc-600' };
  }
  if (name.includes('thread') || id.includes('thread')) {
    return { icon: 'linear_scale', bgGradient: 'from-blue-500/20 to-slate-500/20', iconColor: 'text-blue-500' };
  }
  if (name.includes('stethoscope') || id.includes('stethoscope')) {
    return { icon: 'hearing', bgGradient: 'from-pink-500/20 to-rose-500/20', iconColor: 'text-pink-500' };
  }
  if (name.includes('impact') || id.includes('impact-driver')) {
    return { icon: 'flash_auto', bgGradient: 'from-orange-500/20 to-amber-600/20', iconColor: 'text-orange-600' };
  }
  if (name.includes('straight edge') || id.includes('straight-edge')) {
    return { icon: 'horizontal_rule', bgGradient: 'from-slate-500/20 to-zinc-500/20', iconColor: 'text-slate-500' };
  }
  if (name.includes('pulley') || id.includes('pulley')) {
    return { icon: 'highlight', bgGradient: 'from-emerald-500/20 to-green-500/20', iconColor: 'text-emerald-500' };
  }
  if (name.includes('crowfoot') || id.includes('crowfoot')) {
    return { icon: 'build_circle', bgGradient: 'from-blue-600/20 to-indigo-600/20', iconColor: 'text-blue-600' };
  }
  if (name.includes('profilometer') || id.includes('profilometer')) {
    return { icon: 'waves', bgGradient: 'from-cyan-500/20 to-teal-500/20', iconColor: 'text-cyan-600' };
  }

  // Civil tools
  if (name.includes('auto-level') || name.includes('dumpy') || id.includes('auto-level')) {
    return { icon: 'visibility', bgGradient: 'from-indigo-500/20 to-purple-500/20', iconColor: 'text-indigo-500' };
  }
  if (name.includes('slump') || id.includes('slump')) {
    return { icon: 'architecture', bgGradient: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-500' };
  }
  if (name.includes('covermeter') || name.includes('scanner') || id.includes('covermeter')) {
    return { icon: 'radar', bgGradient: 'from-indigo-600/20 to-blue-600/20', iconColor: 'text-indigo-600' };
  }
  if (name.includes('plumb') || id.includes('plumb')) {
    return { icon: 'vertical_align_bottom', bgGradient: 'from-amber-600/20 to-yellow-600/20', iconColor: 'text-amber-600' };
  }
  if (name.includes('laser distance') || name.includes('disto') || id.includes('laser-disto')) {
    return { icon: 'square_foot', bgGradient: 'from-rose-500/20 to-pink-500/20', iconColor: 'text-rose-500' };
  }
  if (name.includes('rebound') || name.includes('schmidt') || id.includes('schmidt')) {
    return { icon: 'fitness_center', bgGradient: 'from-slate-600/20 to-zinc-600/20', iconColor: 'text-slate-600' };
  }
  if (name.includes('total station') || id.includes('total-station')) {
    return { icon: 'center_focus_strong', bgGradient: 'from-purple-500/20 to-indigo-600/20', iconColor: 'text-purple-600' };
  }
  if (name.includes('moisture') || id.includes('moisture')) {
    return { icon: 'water_drop', bgGradient: 'from-sky-500/20 to-cyan-500/20', iconColor: 'text-sky-500' };
  }
  if (name.includes('crack') || id.includes('crack')) {
    return { icon: 'zoom_in', bgGradient: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-500' };
  }
  if (name.includes('penetrometer') || id.includes('dcp')) {
    return { icon: 'arrow_downward', bgGradient: 'from-stone-500/20 to-neutral-600/20', iconColor: 'text-stone-600' };
  }
  if (name.includes('inclinometer') || id.includes('inclinometer')) {
    return { icon: 'swap_vert', bgGradient: 'from-indigo-500/20 to-cyan-500/20', iconColor: 'text-indigo-500' };
  }
  if (name.includes('cube') || id.includes('cube')) {
    return { icon: 'view_module', bgGradient: 'from-slate-600/20 to-stone-600/20', iconColor: 'text-slate-600' };
  }
  if (name.includes('density') || id.includes('density')) {
    return { icon: 'speed', bgGradient: 'from-stone-600/20 to-neutral-700/20', iconColor: 'text-stone-700' };
  }
  if (name.includes('utility') || id.includes('utility')) {
    return { icon: 'wifi_tethering', bgGradient: 'from-teal-500/20 to-emerald-500/20', iconColor: 'text-teal-500' };
  }

  // Software tools
  if (name.includes('wireshark') || name.includes('packet') || id.includes('wireshark')) {
    return { icon: 'network_check', bgGradient: 'from-blue-500/20 to-indigo-500/20', iconColor: 'text-blue-500' };
  }
  if (name.includes('git') || id.includes('git')) {
    return { icon: 'history', bgGradient: 'from-orange-500/20 to-red-500/20', iconColor: 'text-orange-500' };
  }
  if (name.includes('sql') || name.includes('explain') || id.includes('sql')) {
    return { icon: 'database', bgGradient: 'from-cyan-500/20 to-blue-500/20', iconColor: 'text-cyan-500' };
  }
  if (name.includes('docker') || name.includes('logs') || id.includes('docker')) {
    return { icon: 'terminal', bgGradient: 'from-sky-500/20 to-blue-600/20', iconColor: 'text-sky-500' };
  }
  if (name.includes('valgrind') || id.includes('valgrind')) {
    return { icon: 'memory', bgGradient: 'from-rose-500/20 to-red-600/20', iconColor: 'text-rose-500' };
  }
  if (name.includes('postman') || name.includes('api') || id.includes('postman')) {
    return { icon: 'http', bgGradient: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-500' };
  }
  if (name.includes('devtools') || name.includes('chrome') || id.includes('devtools')) {
    return { icon: 'developer_mode', bgGradient: 'from-yellow-500/20 to-amber-500/20', iconColor: 'text-yellow-600' };
  }
  if (name.includes('redis') || name.includes('cache') || id.includes('redis')) {
    return { icon: 'flash_on', bgGradient: 'from-red-500/20 to-rose-600/20', iconColor: 'text-red-500' };
  }
  if (name.includes('kubernetes') || name.includes('k8s') || id.includes('k8s')) {
    return { icon: 'hub', bgGradient: 'from-blue-600/20 to-indigo-600/20', iconColor: 'text-blue-600' };
  }
  if (name.includes('snyk') || name.includes('cve') || id.includes('snyk')) {
    return { icon: 'security', bgGradient: 'from-purple-500/20 to-indigo-500/20', iconColor: 'text-purple-500' };
  }
  if (name.includes('kafka') || id.includes('kafka')) {
    return { icon: 'alt_route', bgGradient: 'from-slate-600/20 to-zinc-700/20', iconColor: 'text-slate-600' };
  }
  if (name.includes('cloudflare') || name.includes('waf') || id.includes('cloudflare')) {
    return { icon: 'shield', bgGradient: 'from-orange-500/20 to-amber-500/20', iconColor: 'text-orange-500' };
  }
  if (name.includes('github') || name.includes('ci/cd') || id.includes('github')) {
    return { icon: 'auto_mode', bgGradient: 'from-zinc-600/20 to-slate-700/20', iconColor: 'text-zinc-600' };
  }
  if (name.includes('terraform') || id.includes('terraform')) {
    return { icon: 'layers', bgGradient: 'from-purple-600/20 to-indigo-600/20', iconColor: 'text-purple-600' };
  }
  if (name.includes('jaeger') || name.includes('tracing') || id.includes('jaeger')) {
    return { icon: 'timeline', bgGradient: 'from-cyan-500/20 to-teal-500/20', iconColor: 'text-cyan-500' };
  }

  // Metallurgy tools
  if (name.includes('microscope') || id.includes('microscope')) {
    return { icon: 'biotech', bgGradient: 'from-rose-500/20 to-pink-500/20', iconColor: 'text-rose-500' };
  }
  if (name.includes('rockwell') || name.includes('vickers') || id.includes('hardness')) {
    return { icon: 'diamond', bgGradient: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-500' };
  }
  if (name.includes('charpy') || id.includes('charpy')) {
    return { icon: 'gavel', bgGradient: 'from-red-500/20 to-rose-600/20', iconColor: 'text-red-500' };
  }
  if (name.includes('pyrometer') || id.includes('pyrometer')) {
    return { icon: 'local_fire_department', bgGradient: 'from-orange-600/20 to-red-600/20', iconColor: 'text-orange-600' };
  }
  if (name.includes('spark') || name.includes('oes') || id.includes('spark')) {
    return { icon: 'flare', bgGradient: 'from-amber-400/20 to-yellow-500/20', iconColor: 'text-amber-500' };
  }
  if (name.includes('ultrasonic') || name.includes('flaw') || id.includes('ultrasonic')) {
    return { icon: 'graphic_eq', bgGradient: 'from-cyan-500/20 to-blue-500/20', iconColor: 'text-cyan-500' };
  }
  if (name.includes('dye') || name.includes('penetrant') || id.includes('dye')) {
    return { icon: 'brush', bgGradient: 'from-lime-500/20 to-green-500/20', iconColor: 'text-lime-600' };
  }
  if (name.includes('universal testing') || name.includes('utm') || id.includes('utm')) {
    return { icon: 'expand', bgGradient: 'from-slate-600/20 to-stone-600/20', iconColor: 'text-slate-600' };
  }
  if (name.includes('furnace') || id.includes('furnace')) {
    return { icon: 'outdoor_grill', bgGradient: 'from-orange-500/20 to-red-500/20', iconColor: 'text-orange-500' };
  }
  if (name.includes('xrd') || name.includes('diffraction') || id.includes('xrd')) {
    return { icon: 'scatter_plot', bgGradient: 'from-indigo-500/20 to-violet-500/20', iconColor: 'text-indigo-500' };
  }
  if (name.includes('mpi') || name.includes('magnetic') || id.includes('mpi')) {
    return { icon: 'attractions', bgGradient: 'from-purple-500/20 to-indigo-500/20', iconColor: 'text-purple-500' };
  }
  if (name.includes('sem') || id.includes('sem')) {
    return { icon: 'smart_display', bgGradient: 'from-blue-600/20 to-cyan-600/20', iconColor: 'text-blue-600' };
  }
  if (name.includes('potentiostat') || id.includes('potentiostat')) {
    return { icon: 'science', bgGradient: 'from-teal-500/20 to-emerald-500/20', iconColor: 'text-teal-600' };
  }

  // Default fallback based on category
  const categoryMap: Record<string, { icon: string; bgGradient: string; iconColor: string }> = {
    diagnostic: { icon: 'insights', bgGradient: 'from-indigo-500/20 to-blue-500/20', iconColor: 'text-indigo-500' },
    mechanical: { icon: 'handyman', bgGradient: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-500' },
    wirework: { icon: 'cable', bgGradient: 'from-cyan-500/20 to-sky-500/20', iconColor: 'text-cyan-500' },
    safety: { icon: 'shield', bgGradient: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-500' },
  };

  return categoryMap[tool.category] || { icon: 'build', bgGradient: 'from-slate-500/20 to-zinc-500/20', iconColor: 'text-slate-500' };
}

export const CompositeAssetView: React.FC<CompositeAssetViewProps> = ({
  tool,
  className = '',
  size = 'md',
  alt,
}) => {
  const { icon, bgGradient, iconColor } = getSpecificInstrumentIcon(tool);

  const containerSizes = {
    sm: 'w-11 h-11 min-w-[44px]',
    md: 'w-16 h-16 min-w-[64px]',
    lg: 'w-24 h-24 min-w-[96px]',
  }[size];

  const iconSizes = {
    sm: 'text-[22px]',
    md: 'text-[32px]',
    lg: 'text-[48px]',
  }[size];

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${bgGradient} border border-slate-200/80 dark:border-slate-700/80 shadow-xs shrink-0 select-none ${containerSizes} ${className}`}
      aria-label={alt || tool.name}
      title={tool.name}
    >
      <span className={`material-symbols-outlined ${iconSizes} ${iconColor} drop-shadow-xs transition-transform group-hover:scale-110`}>
        {icon}
      </span>
    </div>
  );
};
