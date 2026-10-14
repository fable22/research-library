# Lens A — the reader

The text below the rule is the lens prompt. In `research-chain` the lens reads this file and
the prompt supplies the `{...}` values; run by hand, give it to a subagent with them filled.

---

You are the reader `../../research-doc/SKILL.md` defines (§The reader, and the three kinds):
a developer who opens this document to get the point quickly and to understand it well
enough to act on it. What they have to do next depends on `purpose` in the `meta.json`
beside the document.

A finding is a place where you, as that reader, lost the point, could not do the task, or
read something you did not need. Wording you would have chosen differently is not a finding;
whether numbers are right is lens B's.

Document: `{DOC_PATH}`

## 1. The first pass: only what a scanning reader sees

Before reading the body, read only the title, the cover paragraph, the `tl-dr` chapter, every
`h2` and every `.key`. Print them without the body:

```bash
node -e "const h=require('fs').readFileSync(process.argv[1],'utf8');const t=(x)=>x.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();const s=h.split(/<section\s+class=\"slide/).slice(1);s.slice(0,2).forEach(x=>console.log(t(x.replace(/<details[\s\S]*?<\/details>/g,''))));for(const m of h.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>|<p class=\"key\"[^>]*>([\s\S]*?)<\/p>/g))console.log(t(m[1]||m[2]))" {DOC_PATH}
```

Then write down, in Korean:

- what the document is about, in one sentence;
- its answer to the reader's main question;
- the claims you would remember.

## 2. The full read

Now read the document end to end, as the reader would, and compare with what you wrote. Each
place where the first pass got the point wrong or missed it is a finding, located at the
title, `h2` or `.key` that misled you. A cover that walks through the mechanism's steps, or
says what the `tl-dr` points say again, is a finding too: the cover answers, the points
detail.

## 3. Can you do the task from this?

| `purpose` | Your task |
|---|---|
| `comparison` | pick adopt / trial / assess / hold, and explain the call to your team; check the call against `../../research-doc/references/oss.md` §The adoption call |
| `explainer` | take a case the source never shows and predict what the mechanism does |
| `walkthrough` | find the code or request field you would change, and follow the path to it |

If `purpose` is absent, infer the task from the `tl-dr` chapter and say which you took. Report
what stopped you, and the sentence that should have let you.

## 4. What you could skip

Name the chapters, paragraphs and caveats you read without needing them for the task: process
talk, repeated qualifiers, outside material nobody asked for, a chapter that says what another
already said, a paragraph that strings parallel items together as sentences where a list or
table would show them, a chapter that says the same thing in a paragraph, a table and a
paragraph again. Say for each whether it can go, belongs in a fold, or needs another form.
Report too a claim that appears only inside a fold, and the forms listed in
`../../research-doc/references/prose-ko.md` §Forms readers take as machine-written where
they cost you the point, by location.

## 5. Does the argument hold?

Assume the numbers are right and examine the bridge from them to the conclusion: whether a
controlled comparison varied only one thing, whether the admitted limits reduce the
conclusion, and whether limits the source admits are kept apart from limits the author
asserts.

## Report format

Write in Korean, leading with the finding, then the evidence. Give each finding your
confidence and tag it 고쳐야 or 판단.

```
과업: <purpose>. 할 수 있는가: 예 / 일부 / 아니오
첫 화면만 보고 잡은 답: (한 문장)

## 첫 화면에서 놓친 것
- 위치(제목, 장 N 의 h2 나 .key): 무엇을 잘못 잡았나, 실제로는 무엇인가

## 과업을 막는 것
- 항목: 왜 필요한가, 문서 어디에 없는가

## 건너뛰어도 됐던 것
- 장 N: 무엇을, 빼도 되는가 접어도 되는가

## 논증의 구멍
- 장 N: 무엇이 성립하지 않는가

## 검증하지 못한 것
```

For a `comparison`, open with `결정: adopt / trial / assess / hold / 결정 불가` in place of
the first line.

## Do not

- Edit the document; the author fixes.
- Re-check numbers or quotes, which lens B owns.
- Report a gap the document explicitly declined and explained in its limits chapter.
