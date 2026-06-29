'use client';

import React, { memo } from "react";

type IconName = "whatsapp";

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

const icons: Record<IconName, React.ReactNode> = {
  whatsapp: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-whatsapp">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
      <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
    </svg>
  ),

};

function IconComp({ name, size = 22, color = "white" }: Props) {
  return (
    <span
      style={{ width: size, height: size, color }}
      className="inline-flex items-center justify-center"
    >
      {icons[name]}
    </span>
  );
}

export default memo(IconComp);