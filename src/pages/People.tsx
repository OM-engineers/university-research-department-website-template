import { Card } from '../components/Card';
import { SectionTitle } from '../components/SectionTitle';
import { useData } from '../lib/lang';

export function PeoplePage() {
  const people = useData('people');
  const groups = useData('site').groups;

  return (
    <main className="mx-auto w-full max-w-300 px-4 pt-12 pb-12 sm:px-6 lg:px-10">
      <SectionTitle as="h1" title={people.title} />
      <p className="mt-3 max-w-prose text-lg text-text-muted">{people.intro}</p>

      {groups.map((group) => {
        const members = people.items.filter((p) => p.group === group.value);
        if (members.length === 0) return null;
        const small = group.value === 'members';
        return (
          <section key={group.value} className="mt-12 first-of-type:mt-8">
            <SectionTitle title={group.label} />
            <ul
              className={`mt-6 grid gap-6 ${small ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-4'}`}
            >
              {members.map((person) => (
                <li key={person.id}>
                  <Card variant={small ? 'member' : 'person'} person={person} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
