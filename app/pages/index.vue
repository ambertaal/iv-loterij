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

const namesText = ref('Amber\nPeter\nNina')
setParticipantsFromText(namesText.value)

function applyNames() {
  setParticipantsFromText(namesText.value)
}

function clearAll() {
  namesText.value = ''
  clearParticipants()
  clearSharedNames()
}

// Public sign-up: anyone with the page link can add their own name to a
// shared, realtime list (Firebase Realtime Database), which is then
// auto-merged into the local draw pool above for every viewer (see watch
// below).
const { sharedEntries, addSharedName, clearSharedNames } = useSharedParticipants()
const joinName = ref('')
const shareUrl = ref('')

onMounted(() => {
  shareUrl.value = window.location.href
})

async function submitJoin() {
  if (!joinName.value.trim()) return
  await addSharedName(joinName.value)
  joinName.value = ''
}

function importSharedNames() {
  const existing = new Set(participants.value.map((n) => n.toLowerCase()))
  const newNames = sharedEntries.value
    .map((e) => e.name)
    .filter((name) => !existing.has(name.toLowerCase()))
  if (!newNames.length) return
  namesText.value = [namesText.value, ...newNames].filter(Boolean).join('\n')
  applyNames()
}

// Auto-sync sign-ups into the draw list for every viewer as they arrive,
// so the host never has to manually pull names in.
watch(sharedEntries, importSharedNames)

async function copyShareUrl() {
  if (!shareUrl.value) return
  await navigator.clipboard.writeText(shareUrl.value)
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
          <img src="/logo.svg" alt="Iv logo" class="h-12 w-12" />
          <div>
            <p class="font-mono text-xs uppercase tracking-[0.2em] text-primary">ONE</p>
            <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Lottery</h1>
          </div>
        </div>
        <div class="flex gap-8 font-mono text-sm">
          <div>
            <p class="text-muted-foreground">Participants</p>
            <p class="text-2xl font-semibold">{{ participants.length }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Draws</p>
            <p class="text-2xl font-semibold">{{ drawCount }}</p>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">

        <!-- left column -->
        <div class="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>00 &middot; Add your name</CardTitle>
              <CardDescription>Want to join the lottery?</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
              <form class="flex gap-2" @submit.prevent="submitJoin">
                <Input v-model="joinName" placeholder="Your name" maxlength="40" />
                <Button type="submit" :disabled="!joinName.trim()">Add me</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>01 &middot; Participant list</CardTitle>
              <CardDescription>One name per line.</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
              <Textarea v-model="namesText" :rows="6" />
              <div class="flex flex-wrap gap-2">
                <Button variant="default" @click="applyNames">Update list</Button>
                <Button variant="outline" @click="clearAll">Clear all</Button>
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
                    :aria-label="`Remove ${name}`"
                    @click="removeParticipant(idx)"
                  >
                    &times;
                  </button>
                </span>
              </div>

              <div class="flex items-center gap-3 pt-1">
                <Checkbox v-model="autoRemoveWinner" id="auto-remove" />
                <Label for="auto-remove" class="font-mono text-xs text-muted-foreground">
                  Automatically remove winner from the list after the draw
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>02 &middot; Prize</CardTitle>
              <CardDescription>What is there to win in this draw?</CardDescription>
            </CardHeader>
            <CardContent>
              <Input v-model="prize" placeholder="E.g. a movie voucher" />
            </CardContent>
          </Card>
        </div>

        <!-- right column -->
        <div class="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>03 &middot; Draw</CardTitle>
              <CardDescription v-if="prize">
                To win: <span class="text-foreground">{{ prize }}</span>
              </CardDescription>
              <CardDescription v-else>First fill in what there is to win (optional).</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col items-center gap-6">
              <LotteryWheel
                ref="wheelRef"
                :names="participants"
                @spin-start="onSpinStart"
                @spin-complete="onSpinComplete"
              />
              <p v-if="!canDraw" class="font-mono text-sm text-muted-foreground">
                Add at least 2 names to be able to draw.
              </p>
              <Button size="lg" :disabled="!canDraw || isSpinning" @click="draw">
                {{ isSpinning ? 'Wheel spinning…' : 'Draw a winner' }}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>04 &middot; Log</CardTitle>
              <CardDescription v-if="!winners.length">No draws have been made yet.</CardDescription>
            </CardHeader>
            <CardContent v-if="winners.length">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-14">No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Prize</TableHead>
                    <TableHead class="w-40">Date &amp; time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="w in winners" :key="w.id">
                    <TableCell class="font-mono text-muted-foreground">{{ String(w.drawNumber).padStart(2, '0') }}</TableCell>
                    <TableCell class="font-semibold">{{ w.name }}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{{ w.prize }}</Badge>
                    </TableCell>
                    <TableCell class="font-mono text-muted-foreground">{{ w.date }} {{ w.time }}</TableCell>
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
          <DialogTitle>Winner drawn</DialogTitle>
          <DialogDescription>Draw #{{ lastWinner?.drawNumber }}</DialogDescription>
        </DialogHeader>
        <div class="py-4 text-center">
          <p class="text-3xl font-bold text-primary">{{ lastWinner?.name }}</p>
          <p class="mt-2 text-muted-foreground">wins: <span class="text-foreground">{{ lastWinner?.prize }}</span></p>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button class="w-full sm:w-auto">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
