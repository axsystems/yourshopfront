import * as React from "react"

import { Container, Section, Stat } from "@/components/apex"
import { FadeUp } from "@/components/apex/motion/fade-up"

/**
 * Truthful deliverable specs (master brief §5.6). Replaces the audit's flagged
 * fake "★★★★★ 4.9 / 47 Google reviews" + "100+ sites launched" trust strip.
 */
export function HomeStatStrip() {
  return (
    <Section bg="canvas" className="py-16 md:py-20">
      <Container>
        <FadeUp>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
            <Stat
              tone="coral"
              value="24h"
              label="Live within 24 hours"
              caption="From content receipt"
            />
            <Stat
              value="30"
              label="Designs ready to ship"
              caption="Across home services and adjacent trades"
            />
            <Stat
              tone="cobalt"
              value="$0"
              label="Setup commitment"
              caption="Subscription tier — cancel any time, no contract"
            />
            <Stat
              tone="mint"
              value="30 days"
              label="Money-back guarantee"
              caption="On the first month"
            />
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}
