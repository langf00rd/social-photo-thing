import Image from "next/image";

export default function CardStack(props: { title: string; images: string[] }) {
  return (
    <div className="relative group space-y-4">
      <div className="relative aspect-square flex-1 cursor-pointer">
        {props.images.slice(0, 3).map((img, index) => {
          const rotations = ["-5deg", "0deg", "5deg"];
          const backgrounds = [
            "bg-neutral-50",
            "bg-neutral-100",
            "bg-neutral-200",
          ];
          return (
            <div
              key={index}
              className={`w-full h-full absolute top-0 left-0 border transition-transform group-hover:rotate-[${rotations[index]}] ${backgrounds[index]}`}
            >
              {img && (
                <Image
                  src={img}
                  alt="Moodboard Image"
                  className="object-cover w-full h-full"
                  width={500}
                  height={500}
                />
              )}
            </div>
          );
        })}
      </div>
      <div>
        <p className="font-medium">{props.title}</p>
        <p className="text-sm text-neutral-400">{props.images.length} images</p>
      </div>
    </div>
  );
}
