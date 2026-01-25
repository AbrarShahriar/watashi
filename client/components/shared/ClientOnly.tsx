"use client";

import { useEffect, useEffectEvent, useState } from "react";

export default function ClientOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasMounted, setHasMounted] = useState(false);

  const handleMountedChange = useEffectEvent((val: boolean) => {
    setHasMounted(val);
  });

  useEffect(() => {
    handleMountedChange(true);
  }, []);

  if (!hasMounted) return null;

  return <>{children}</>;
}
