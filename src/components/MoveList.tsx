interface MoveListProps {
  moves: string[];
}

export function MoveList({ moves }: MoveListProps) {
  // Группируем по два хода: ход белых + ход чёрных
  const rows = [];
  for (let i = 0; i < moves.length; i += 2) {
    const whiteMove = moves[i];
    const blackMove = moves[i + 1] ?? "";
    const moveNumber = i / 2 + 1;

    rows.push({ moveNumber, whiteMove, blackMove });
  }

  return (
    <div
      style={{
        backgroundColor: "#020617",
        borderRadius: "8px",
        padding: "8px 12px",
        color: "#e5e7eb",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        maxHeight: "400px",
        overflowY: "auto",
        border: "1px solid #1f2937",
      }}
    >
      <div
        style={{
          marginBottom: "8px",
          fontWeight: 600,
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        История ходов
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                paddingBottom: "4px",
                fontWeight: 500,
              }}
            >
              №
            </th>
            <th
              style={{
                textAlign: "left",
                paddingBottom: "4px",
                fontWeight: 500,
              }}
            >
              Белые
            </th>
            <th
              style={{
                textAlign: "left",
                paddingBottom: "4px",
                fontWeight: 500,
              }}
            >
              Чёрные
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.moveNumber}>
              <td
                style={{
                  padding: "2px 4px",
                  width: "24px",
                  color: "#9ca3af",
                }}
              >
                {row.moveNumber}.
              </td>
              <td style={{ padding: "2px 4px" }}>{row.whiteMove}</td>
              <td style={{ padding: "2px 4px" }}>{row.blackMove}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {moves.length === 0 && (
        <div
          style={{
            marginTop: "4px",
            fontSize: "12px",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Ходов пока нет
        </div>
      )}
    </div>
  );
}
