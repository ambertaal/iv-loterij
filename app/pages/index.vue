<script setup lang="ts">
const {
  participants,
  prize,
  autoRemoveWinner,
  winners,
  drawCount,
  canDraw,
  setParticipantsFromText,
  removeParticipant,
  clearParticipants,
  pickWinner,
  recordWinner
} = useLottery()

const namesText = ref('Amber\nJeroen\nCas\nNina')
setParticipantsFromText(namesText.value)

function applyNames() {
  setParticipantsFromText(namesText.value)
}

function clearAll() {
  namesText.value = ''
  clearParticipants()
}

const wheelRef = ref<{ spin: (index: number) => void } | null>(null)
const isSpinning = ref(false)
const showWinnerDialog = ref(false)
const lastWinner = ref<{ name: string; prize: string; drawNumber: number } | null>(null)

function draw() {
  if (!canDraw.value || isSpinning.value) return
  const { index } = pickWinner()
  wheelRef.value?.spin(index)
}

function onSpinStart() {
  isSpinning.value = true
}

function onSpinComplete(index: number) {
  isSpinning.value = false
  const entry = recordWinner(index)
  lastWinner.value = { name: entry.name, prize: entry.prize, drawNumber: entry.drawNumber }
  showWinnerDialog.value = true
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="mx-auto max-w-6xl px-5 py-8 sm:py-10">

      <!-- header -->
      <header class="mb-8 flex flex-wrap items-center justify-between gap-6 border-b border-border pb-6">
        <div class="flex items-center gap-4">
          <img src="/iv-logo.png" alt="Iv logo" class="h-12 w-12" />
          <div>
            <p class="font-mono text-xs uppercase tracking-[0.2em] text-primary">Trekkingsinstrument</p>
            <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Iv Loterij</h1>
          </div>
        </div>
        <div class="flex gap-8 font-mono text-sm">
          <div>
            <p class="text-muted-foreground">Deelnemers</p>
            <p class="text-2xl font-semibold">{{ participants.length }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Trekkingen</p>
            <p class="text-2xl font-semibold">{{ drawCount }}</p>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">

        <!-- left column -->
        <div class="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>01 &middot; Deelnemerslijst</CardTitle>
              <CardDescription>Eén naam per regel.</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
              <Textarea v-model="namesText" placeholder="Amber&#10;Jeroen&#10;Cas&#10;Nina" :rows="6" />
              <div class="flex flex-wrap gap-2">
                <Button variant="default" @click="applyNames">Lijst bijwerken</Button>
                <Button variant="outline" @click="clearAll">Alles wissen</Button>
              </div>

              <div v-if="participants.length" class="flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1">
                <span
                  v-for="(name, idx) in participants"
                  :key="`${name}-${idx}`"
                  class="flex items-center gap-2 rounded-md border border-border bg-secondary/60 py-1 pl-3 pr-1 text-sm"
                >
                  {{ name }}
                  <button
                    type="button"
                    class="rounded px-1.5 text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    :aria-label="`Verwijder ${name}`"
                    @click="removeParticipant(idx)"
                  >
                    &times;
                  </button>
                </span>
              </div>

              <div class="flex items-center gap-3 pt-1">
                <Checkbox v-model="autoRemoveWinner" id="auto-remove" />
                <Label for="auto-remove" class="font-mono text-xs text-muted-foreground">
                  Winnaar automatisch uit de lijst verwijderen na trekking
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>02 &middot; Prijs</CardTitle>
              <CardDescription>Wat is er te winnen bij deze trekking?</CardDescription>
            </CardHeader>
            <CardContent>
              <Input v-model="prize" placeholder="Bijv. een bioscoopbon" />
            </CardContent>
          </Card>
        </div>

        <!-- right column -->
        <div class="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>03 &middot; Trekking</CardTitle>
              <CardDescription v-if="prize">
                Te winnen: <span class="text-foreground">{{ prize }}</span>
              </CardDescription>
              <CardDescription v-else>Vul eerst in wat er te winnen is (optioneel).</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col items-center gap-6">
              <LotteryWheel
                ref="wheelRef"
                :names="participants"
                @spin-start="onSpinStart"
                @spin-complete="onSpinComplete"
              />
              <p v-if="!canDraw" class="font-mono text-sm text-muted-foreground">
                Voeg minimaal 2 namen toe om te kunnen trekken.
              </p>
              <Button size="lg" :disabled="!canDraw || isSpinning" @click="draw">
                {{ isSpinning ? 'Rad draait…' : 'Trek een winnaar' }}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>04 &middot; Trekkingslogboek</CardTitle>
              <CardDescription v-if="!winners.length">Nog geen trekkingen uitgevoerd.</CardDescription>
            </CardHeader>
            <CardContent v-if="winners.length">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-14">Nr.</TableHead>
                    <TableHead>Naam</TableHead>
                    <TableHead>Prijs</TableHead>
                    <TableHead class="w-28">Tijd</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="w in winners" :key="w.id">
                    <TableCell class="font-mono text-muted-foreground">{{ String(w.drawNumber).padStart(2, '0') }}</TableCell>
                    <TableCell class="font-semibold">{{ w.name }}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{{ w.prize }}</Badge>
                    </TableCell>
                    <TableCell class="font-mono text-muted-foreground">{{ w.time }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- winner dialog -->
    <Dialog v-model:open="showWinnerDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Winnaar getrokken</DialogTitle>
          <DialogDescription>Trekking #{{ lastWinner?.drawNumber }}</DialogDescription>
        </DialogHeader>
        <div class="py-4 text-center">
          <p class="text-3xl font-bold text-primary">{{ lastWinner?.name }}</p>
          <p class="mt-2 text-muted-foreground">wint: <span class="text-foreground">{{ lastWinner?.prize }}</span></p>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button class="w-full sm:w-auto">Sluiten</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
