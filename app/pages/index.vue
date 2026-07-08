<script setup lang="ts">
import { UserPlus, Users, Gift, Sparkles, ScrollText, PartyPopper } from '@lucide/vue'

const {
  participants,
  prize,
  canDraw,
  setParticipantsFromText,
  removeParticipant,
  clearParticipants,
  pickWinner,
  recordWinner
} = useLottery()

// Shared, realtime winner log (Firebase Realtime Database): every draw is
// pushed here so all visitors see the same history instead of each tab only
// seeing its own local draws.
const { sharedWinners: winners, pushWinner, clearSharedWinners, removeWinner } = useSharedWinners()
const drawCount = computed(() => winners.value.length)

const prizeText = ref('')

function applyPrize() {
  prize.value = prizeText.value.trim()
}

async function clearLog() {
  if (!winners.value.length) return
  if (!window.confirm('Clear the entire winner log for everyone? This cannot be undone.')) return
  await clearSharedWinners()
}

async function undoLastDraw() {
  const last = winners.value[0]
  if (!last) return
  if (!window.confirm(`Undo draw #${last.drawNumber} (${last.name})? They'll be added back to the pool.`)) return
  participants.value.push(last.name)
  namesText.value = participants.value.join('\n')
  await removeWinner(last.id)
}

const namesText = ref('')
setParticipantsFromText(namesText.value)

async function applyNames() {
  setParticipantsFromText(namesText.value)
  const existingShared = new Set(sharedEntries.value.map((e) => e.name.toLowerCase()))
  const newNames = participants.value.filter((name) => !existingShared.has(name.toLowerCase()))
  for (const name of newNames) {
    await addSharedName(name)
  }
}

function clearAll() {
  if (!window.confirm('Clear all participants for everyone? This cannot be undone.')) return
  namesText.value = ''
  clearParticipants()
  clearSharedNames()
}

// Public sign-up: anyone with the page link can add their own name to a
// shared, realtime list (Firebase Realtime Database), which is then
// auto-merged into the local draw pool above for every viewer (see watch
// below).
const { sharedEntries, addSharedName, clearSharedNames, removeSharedName } = useSharedParticipants()
const joinName = ref('')
const justJoined = ref(false)
const alreadyJoined = ref(false)
let joinMessageTimeout: ReturnType<typeof setTimeout> | undefined

async function submitJoin() {
  const trimmed = joinName.value.trim()
  if (!trimmed) return

  clearTimeout(joinMessageTimeout)
  const isDuplicate = sharedEntries.value.some((e) => e.name.toLowerCase() === trimmed.toLowerCase())
  if (isDuplicate) {
    justJoined.value = false
    alreadyJoined.value = true
    joinMessageTimeout = setTimeout(() => { alreadyJoined.value = false }, 3000)
    return
  }

  await addSharedName(trimmed)
  joinName.value = ''
  alreadyJoined.value = false
  justJoined.value = true
  joinMessageTimeout = setTimeout(() => { justJoined.value = false }, 3000)
}

async function removeParticipantEverywhere(idx: number) {
  const name = participants.value[idx]
  removeParticipant(idx)
  namesText.value = participants.value.join('\n')
  const match = sharedEntries.value.find((e) => e.name.toLowerCase() === name?.toLowerCase())
  if (match) await removeSharedName(match.id)
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
  const entry = recordWinner(index, winners.value.length + 1)
  lastWinner.value = { name: entry.name, prize: entry.prize, drawNumber: entry.drawNumber }
  showWinnerDialog.value = true
  pushWinner({ drawNumber: entry.drawNumber, name: entry.name, prize: entry.prize, date: entry.date, time: entry.time })
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
              <CardTitle class="flex items-center gap-2">
                <UserPlus class="h-4 w-4 text-primary" />
                Add your name
              </CardTitle>
              <CardDescription>Want to join the lottery?</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
              <form class="flex gap-2" @submit.prevent="submitJoin">
                <Input v-model="joinName" placeholder="Your name" maxlength="40" />
                <Button type="submit" :disabled="!joinName.trim()">Add me</Button>
              </form>
              <p v-if="justJoined" class="font-mono text-xs text-primary">You're in! Good luck.</p>
              <p v-else-if="alreadyJoined" class="font-mono text-xs text-muted-foreground">You're already on the list.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Users class="h-4 w-4 text-primary" />
                Participant list
              </CardTitle>
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
                    @click="removeParticipantEverywhere(idx)"
                  >
                    &times;
                  </button>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Gift class="h-4 w-4 text-primary" />
                Prize
              </CardTitle>
              <CardDescription>What is there to win in this draw?</CardDescription>
            </CardHeader>
            <CardContent>
              <form class="flex gap-2" @submit.prevent="applyPrize">
                <Input v-model="prizeText" placeholder="E.g. a movie voucher" />
                <Button type="submit">Add prize</Button>
              </form>
              <p v-if="prize" class="mt-3 font-mono text-xs text-muted-foreground">
                Current prize: <span class="text-foreground">{{ prize }}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <!-- right column -->
        <div class="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Sparkles class="h-4 w-4 text-primary" />
                Draw
              </CardTitle>
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
              <div class="flex items-start justify-between gap-4">
                <div>
                  <CardTitle class="flex items-center gap-2">
                    <ScrollText class="h-4 w-4 text-primary" />
                    Log
                  </CardTitle>
                  <CardDescription v-if="!winners.length">No draws have been made yet.</CardDescription>
                </div>
                <div v-if="winners.length" class="flex gap-2">
                  <Button variant="outline" size="sm" @click="undoLastDraw">Undo last draw</Button>
                  <Button variant="outline" size="sm" @click="clearLog">Clear log</Button>
                </div>
              </div>
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

      <!-- footer -->
      <footer class="mt-10 border-t border-border pt-6 text-center font-mono text-xs text-muted-foreground">
        Made by Nina &amp; Amber
      </footer>
    </div>

    <!-- winner dialog -->
    <Dialog v-model:open="showWinnerDialog">
      <DialogContent>
        <DialogHeader class="items-center text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <PartyPopper class="h-8 w-8 text-primary" />
          </div>
          <DialogTitle class="text-xl">We have a winner!</DialogTitle>
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
